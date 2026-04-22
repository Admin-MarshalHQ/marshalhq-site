-- MarshalHQ database schema
-- Run in the Supabase SQL editor for a fresh pilot environment.
-- This file is written to be safe to re-run for policy/function updates.

-- 1. Profiles table (extends auth.users)
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

-- 5. Enable RLS
alter table profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table reviews enable row level security;

-- 6. Public-safe profiles view
drop view if exists public_profiles;

create view public_profiles as
select
  id,
  role,
  full_name,
  location,
  bio,
  day_rate_min,
  day_rate_max,
  travel_radius_miles,
  has_sia,
  has_cscs,
  has_first_aid,
  has_own_transport,
  avg_rating,
  total_jobs,
  created_at
from profiles;

grant select on public_profiles to authenticated;

-- 7. Profile policies
drop policy if exists "Users can view all profiles" on profiles;
drop policy if exists "Users can select own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

create policy "Users can select own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 8. Job policies
drop policy if exists "Anyone authenticated can view live jobs" on jobs;
drop policy if exists "Authenticated users can view live or related jobs" on jobs;
drop policy if exists "Managers can insert jobs" on jobs;
drop policy if exists "Managers can update own jobs" on jobs;

create policy "Authenticated users can view live or related jobs"
  on jobs for select
  to authenticated
  using (
    status = 'live'
    or posted_by = auth.uid()
    or exists (
      select 1
      from applications
      where applications.job_id = jobs.id
        and applications.applicant_id = auth.uid()
    )
  );

create policy "Managers can insert jobs"
  on jobs for insert
  to authenticated
  with check (
    exists (
      select 1
      from profiles
      where id = auth.uid() and role = 'manager'
    )
  );

create policy "Managers can update own jobs"
  on jobs for update
  to authenticated
  using (posted_by = auth.uid())
  with check (posted_by = auth.uid());

-- 9. Application policies
drop policy if exists "Applicants can view own applications" on applications;
drop policy if exists "Marshals can insert applications" on applications;
drop policy if exists "Marshals can insert applications to open jobs" on applications;
drop policy if exists "Job owner can update application status" on applications;
drop policy if exists "Marshals can withdraw own pending applications" on applications;

create policy "Applicants can view own applications"
  on applications for select
  to authenticated
  using (
    applicant_id = auth.uid()
    or exists (
      select 1
      from jobs
      where jobs.id = applications.job_id
        and jobs.posted_by = auth.uid()
    )
  );

create policy "Marshals can insert applications to open jobs"
  on applications for insert
  to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (
      select 1
      from profiles
      join jobs on jobs.id = applications.job_id
      where profiles.id = auth.uid()
        and profiles.role = 'marshal'
        and jobs.status = 'live'
        and jobs.slots_filled < jobs.slots_needed
    )
  );

-- 10. Review policies
drop policy if exists "Anyone authenticated can view reviews" on reviews;
drop policy if exists "Users can insert reviews for completed jobs" on reviews;

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
      exists (
        select 1
        from applications a
        join jobs j on j.id = a.job_id
        where a.job_id = job_id
          and a.applicant_id = auth.uid()
          and a.status = 'accepted'
          and reviewed_user_id = j.posted_by
      )
      or exists (
        select 1
        from jobs j
        join applications a on a.job_id = j.id
        where j.id = job_id
          and j.posted_by = auth.uid()
          and a.applicant_id = reviewed_user_id
          and a.status = 'accepted'
      )
    )
  );

-- 11. Rating aggregation trigger
create or replace function update_user_rating()
returns trigger as $$
begin
  update profiles
  set
    avg_rating = (
      select round(avg(rating)::numeric, 2)
      from reviews
      where reviewed_user_id = new.reviewed_user_id
    ),
    total_jobs = (
      select count(distinct job_id)
      from reviews
      where reviewed_user_id = new.reviewed_user_id
    )
  where id = new.reviewed_user_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists on_review_insert on reviews;

create trigger on_review_insert
  after insert on reviews
  for each row
  execute function update_user_rating();

-- 12. Protect profile-owned system fields
create or replace function protect_profile_fields()
returns trigger as $$
begin
  new.role := old.role;
  new.avg_rating := old.avg_rating;
  new.total_jobs := old.total_jobs;
  new.reliability_pct := old.reliability_pct;
  return new;
end;
$$ language plpgsql;

drop trigger if exists protect_profile_fields_trigger on profiles;

create trigger protect_profile_fields_trigger
  before update on profiles
  for each row
  execute function protect_profile_fields();

-- 13. Lifecycle and contact RPCs
create or replace function accept_application(p_application_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id uuid;
  v_posted_by uuid;
  v_application_status text;
  v_job_status text;
  v_slots_filled integer;
  v_slots_needed integer;
begin
  select
    a.job_id,
    j.posted_by,
    a.status,
    j.status,
    j.slots_filled,
    j.slots_needed
  into
    v_job_id,
    v_posted_by,
    v_application_status,
    v_job_status,
    v_slots_filled,
    v_slots_needed
  from applications a
  join jobs j on j.id = a.job_id
  where a.id = p_application_id
  for update of a, j;

  if not found then
    raise exception 'Application not found.';
  end if;

  if v_posted_by <> auth.uid() then
    raise exception 'You do not have access to this application.';
  end if;

  if v_job_status <> 'live' then
    raise exception 'Only live jobs can accept applications.';
  end if;

  if v_application_status <> 'pending' then
    raise exception 'Only pending applications can be accepted.';
  end if;

  if v_slots_filled >= v_slots_needed then
    raise exception 'All slots have already been filled.';
  end if;

  update applications
  set status = 'accepted'
  where id = p_application_id;

  update jobs
  set
    slots_filled = slots_filled + 1,
    status = case
      when slots_filled + 1 >= slots_needed then 'filled'
      else status
    end
  where id = v_job_id;

  if v_slots_filled + 1 >= v_slots_needed then
    update applications
    set status = 'declined'
    where job_id = v_job_id
      and status = 'pending'
      and id <> p_application_id;
  end if;
end;
$$;

create or replace function decline_application(p_application_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_posted_by uuid;
  v_application_status text;
begin
  select j.posted_by, a.status
  into v_posted_by, v_application_status
  from applications a
  join jobs j on j.id = a.job_id
  where a.id = p_application_id
  for update of a, j;

  if not found then
    raise exception 'Application not found.';
  end if;

  if v_posted_by <> auth.uid() then
    raise exception 'You do not have access to this application.';
  end if;

  if v_application_status <> 'pending' then
    raise exception 'Only pending applications can be declined.';
  end if;

  update applications
  set status = 'declined'
  where id = p_application_id;
end;
$$;

create or replace function withdraw_application(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application_status text;
begin
  select status
  into v_application_status
  from applications
  where job_id = p_job_id
    and applicant_id = auth.uid()
  for update;

  if not found then
    raise exception 'Application not found.';
  end if;

  if v_application_status <> 'pending' then
    raise exception 'Only pending applications can be withdrawn.';
  end if;

  update applications
  set status = 'withdrawn'
  where job_id = p_job_id
    and applicant_id = auth.uid();
end;
$$;

create or replace function cancel_job(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_posted_by uuid;
  v_job_status text;
begin
  select posted_by, status
  into v_posted_by, v_job_status
  from jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'Job not found.';
  end if;

  if v_posted_by <> auth.uid() then
    raise exception 'You do not have access to this job.';
  end if;

  if v_job_status = 'completed' then
    raise exception 'Completed jobs cannot be cancelled.';
  end if;

  if v_job_status = 'cancelled' then
    return;
  end if;

  update applications
  set status = 'declined'
  where job_id = p_job_id
    and status = 'pending';

  update jobs
  set status = 'cancelled'
  where id = p_job_id;
end;
$$;

create or replace function complete_job(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_posted_by uuid;
  v_job_status text;
  v_accepted_count integer;
begin
  select posted_by, status
  into v_posted_by, v_job_status
  from jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'Job not found.';
  end if;

  if v_posted_by <> auth.uid() then
    raise exception 'You do not have access to this job.';
  end if;

  if v_job_status in ('completed', 'cancelled') then
    raise exception 'Only active jobs can be completed.';
  end if;

  select count(*)
  into v_accepted_count
  from applications
  where job_id = p_job_id
    and status = 'accepted';

  if v_accepted_count = 0 then
    raise exception 'At least one accepted marshal is required before completion.';
  end if;

  update applications
  set status = 'declined'
  where job_id = p_job_id
    and status = 'pending';

  update jobs
  set status = 'completed'
  where id = p_job_id;
end;
$$;

create or replace function get_job_manager_contact(p_job_id uuid)
returns table (
  id uuid,
  full_name text,
  phone text,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from applications
    where job_id = p_job_id
      and applicant_id = auth.uid()
      and status = 'accepted'
  ) then
    raise exception 'Manager contact is only available after acceptance.';
  end if;

  return query
  select p.id, p.full_name, p.phone, p.email
  from jobs j
  join profiles p on p.id = j.posted_by
  where j.id = p_job_id;
end;
$$;

create or replace function get_job_applicant_contacts(p_job_id uuid)
returns table (
  id uuid,
  full_name text,
  phone text,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from jobs
    where id = p_job_id
      and posted_by = auth.uid()
  ) then
    raise exception 'You do not have access to this job.';
  end if;

  return query
  select p.id, p.full_name, p.phone, p.email
  from applications a
  join profiles p on p.id = a.applicant_id
  where a.job_id = p_job_id
    and a.status = 'accepted'
  order by a.applied_at asc;
end;
$$;

revoke all on function accept_application(uuid) from public;
revoke all on function decline_application(uuid) from public;
revoke all on function withdraw_application(uuid) from public;
revoke all on function cancel_job(uuid) from public;
revoke all on function complete_job(uuid) from public;
revoke all on function get_job_manager_contact(uuid) from public;
revoke all on function get_job_applicant_contacts(uuid) from public;

grant execute on function accept_application(uuid) to authenticated;
grant execute on function decline_application(uuid) to authenticated;
grant execute on function withdraw_application(uuid) to authenticated;
grant execute on function cancel_job(uuid) to authenticated;
grant execute on function complete_job(uuid) to authenticated;
grant execute on function get_job_manager_contact(uuid) to authenticated;
grant execute on function get_job_applicant_contacts(uuid) to authenticated;
