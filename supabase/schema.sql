-- MarshalHQ Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('marshal', 'manager')),
  full_name text not null default '',
  email text default '',
  phone text default '',
  location text default '',
  bio text default '',
  profile_photo text default '',
  day_rate_min integer default 140,
  day_rate_max integer default 200,
  travel_radius_miles integer default 30,
  has_sia boolean default false,
  has_cscs boolean default false,
  has_first_aid boolean default false,
  has_own_transport boolean default false,
  availability_mon boolean default true,
  availability_tue boolean default true,
  availability_wed boolean default true,
  availability_thu boolean default true,
  availability_fri boolean default true,
  availability_sat boolean default false,
  availability_sun boolean default false,
  avg_rating numeric(3,2) default 0,
  total_jobs integer default 0,
  reliability_pct integer default 100,
  no_shows integer default 0,
  created_at timestamptz default now()
);

-- 2. Jobs table
create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  requirements text default '',
  location text not null,
  date date not null,
  start_time text default '07:00',
  end_time text default '19:00',
  day_rate integer not null,
  slots_needed integer not null default 1,
  slots_filled integer not null default 0,
  production_name text default '',
  is_urgent boolean default false,
  status text not null default 'live' check (status in ('live', 'filled', 'completed', 'cancelled')),
  posted_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- 3. Applications table
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  applicant_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  message text default '',
  no_show boolean default false,
  applied_at timestamptz default now(),
  unique(job_id, applicant_id)
);

-- 4. Reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  reviewed_user_id uuid references profiles(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text default '',
  created_at timestamptz default now(),
  unique(reviewer_id, reviewed_user_id, job_id)
);

-- 5. Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table reviews enable row level security;

-- 6. RLS Policies for profiles
create policy "Users can view all profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 7. RLS Policies for jobs
create policy "Anyone authenticated can view live jobs"
  on jobs for select
  to authenticated
  using (true);

create policy "Managers can insert jobs"
  on jobs for insert
  to authenticated
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'manager')
  );

create policy "Managers can update own jobs"
  on jobs for update
  to authenticated
  using (posted_by = auth.uid());

-- 8. RLS Policies for applications
create policy "Applicants can view own applications"
  on applications for select
  to authenticated
  using (
    applicant_id = auth.uid()
    or exists (select 1 from jobs where jobs.id = applications.job_id and jobs.posted_by = auth.uid())
  );

create policy "Marshals can insert applications"
  on applications for insert
  to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (select 1 from profiles where id = auth.uid() and role = 'marshal')
  );

create policy "Job owner can update application status"
  on applications for update
  to authenticated
  using (
    exists (select 1 from jobs where jobs.id = applications.job_id and jobs.posted_by = auth.uid())
  );

create policy "Marshals can withdraw own pending applications"
  on applications for update
  to authenticated
  using (applicant_id = auth.uid() and status = 'pending')
  with check (applicant_id = auth.uid() and status = 'withdrawn');

-- 9. RLS Policies for reviews
create policy "Anyone authenticated can view reviews"
  on reviews for select
  to authenticated
  using (true);

create policy "Users can insert reviews for completed jobs"
  on reviews for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (select 1 from jobs where id = job_id and status = 'completed')
    and (
      -- Marshal reviewing the manager who posted the job
      exists (
        select 1 from applications a
        join jobs j on j.id = a.job_id
        where a.job_id = job_id and a.applicant_id = auth.uid()
        and a.status = 'accepted' and reviewed_user_id = j.posted_by
      )
      or
      -- Manager reviewing an accepted marshal
      exists (
        select 1 from jobs j
        join applications a on a.job_id = j.id
        where j.id = job_id and j.posted_by = auth.uid()
        and a.applicant_id = reviewed_user_id and a.status = 'accepted'
      )
    )
  );

-- 10. Rating aggregation trigger
-- Automatically updates avg_rating and total_jobs on profiles when a review is inserted
create or replace function update_user_rating()
returns trigger as $$
begin
  update profiles set
    avg_rating = (select round(avg(rating)::numeric, 2) from reviews where reviewed_user_id = NEW.reviewed_user_id),
    total_jobs = (select count(distinct job_id) from reviews where reviewed_user_id = NEW.reviewed_user_id)
  where id = NEW.reviewed_user_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_review_insert
  after insert on reviews
  for each row
  execute function update_user_rating();

-- 11. Protect sensitive profile fields from direct user modification
-- Prevents users from changing their own role, ratings, or job stats
create or replace function protect_profile_fields()
returns trigger as $$
begin
  NEW.role := OLD.role;
  NEW.avg_rating := OLD.avg_rating;
  NEW.total_jobs := OLD.total_jobs;
  NEW.reliability_pct := OLD.reliability_pct;
  NEW.no_shows := OLD.no_shows;
  return NEW;
end;
$$ language plpgsql;

create trigger protect_profile_fields_trigger
  before update on profiles
  for each row
  execute function protect_profile_fields();

-- 12. Reliability % recompute
-- Keeps profiles.reliability_pct and profiles.no_shows in sync with the
-- applications.no_show flag. Fires when a manager toggles no_show on an
-- accepted application.
create or replace function recompute_reliability()
returns trigger as $$
declare
  target_id uuid := coalesce(NEW.applicant_id, OLD.applicant_id);
  no_show_count integer;
  completed_count integer;
begin
  select count(*) into no_show_count
    from applications
    where applicant_id = target_id and status = 'accepted' and no_show = true;

  select count(*) into completed_count
    from applications a
    join jobs j on j.id = a.job_id
    where a.applicant_id = target_id and a.status = 'accepted' and j.status = 'completed';

  -- Temporarily bypass protect_profile_fields_trigger via security definer
  update profiles set
    no_shows = no_show_count,
    reliability_pct = case
      when completed_count = 0 then 100
      else greatest(0, round(100.0 * (completed_count - no_show_count) / completed_count))::int
    end
  where id = target_id;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_application_no_show_change
  after update of no_show on applications
  for each row
  when (OLD.no_show is distinct from NEW.no_show)
  execute function recompute_reliability();

-- Also recompute when a job's status flips to 'completed' so total-denominator changes take effect
create or replace function recompute_reliability_on_job_status()
returns trigger as $$
declare
  applicant_row record;
begin
  if NEW.status = 'completed' and (OLD.status is distinct from NEW.status) then
    for applicant_row in
      select applicant_id from applications where job_id = NEW.id and status = 'accepted'
    loop
      perform recompute_reliability_for_user(applicant_row.applicant_id);
    end loop;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create or replace function recompute_reliability_for_user(target_id uuid)
returns void as $$
declare
  no_show_count integer;
  completed_count integer;
begin
  select count(*) into no_show_count
    from applications
    where applicant_id = target_id and status = 'accepted' and no_show = true;

  select count(*) into completed_count
    from applications a
    join jobs j on j.id = a.job_id
    where a.applicant_id = target_id and a.status = 'accepted' and j.status = 'completed';

  update profiles set
    no_shows = no_show_count,
    reliability_pct = case
      when completed_count = 0 then 100
      else greatest(0, round(100.0 * (completed_count - no_show_count) / completed_count))::int
    end
  where id = target_id;
end;
$$ language plpgsql security definer;

create trigger on_job_status_completed
  after update of status on jobs
  for each row
  execute function recompute_reliability_on_job_status();

-- 13. Notifications queue
-- Client code inserts rows here; an Edge Function (or pg_net cron) reads and
-- sends email via Resend. Decouples UI from email provider.
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in (
    'application_received',
    'application_accepted',
    'application_declined',
    'job_completed',
    'review_received'
  )),
  job_id uuid references jobs(id) on delete set null,
  actor_id uuid references profiles(id) on delete set null,
  payload jsonb default '{}'::jsonb,
  sent_at timestamptz,
  error text,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

-- Users can only read their own notification history; inserts are from the
-- app client acting on behalf of authenticated actors (the RLS check ensures
-- the actor is the current user so a manager can't spoof a notification as
-- if it came from another user).
create policy "Users view own notifications"
  on notifications for select
  to authenticated
  using (recipient_id = auth.uid());

create policy "Authenticated users insert notifications"
  on notifications for insert
  to authenticated
  with check (actor_id is null or actor_id = auth.uid());

-- ============================================================
-- MIGRATION NOTES (for existing databases)
-- Run these if your database was created before these changes:
-- ============================================================
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';
-- ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
-- ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn'));
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS no_shows integer DEFAULT 0;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS no_show boolean DEFAULT false;
-- Then run the create policy, trigger, and notifications table statements above.
