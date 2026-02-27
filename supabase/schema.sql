-- MarshalHQ Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('marshal', 'manager')),
  full_name text not null default '',
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
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
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

-- 9. RLS Policies for reviews
create policy "Anyone authenticated can view reviews"
  on reviews for select
  to authenticated
  using (true);

create policy "Users can insert reviews for completed jobs"
  on reviews for insert
  to authenticated
  with check (reviewer_id = auth.uid());
