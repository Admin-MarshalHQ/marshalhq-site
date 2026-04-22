-- Break circular RLS evaluation between jobs and applications.
-- The original policies referenced each other directly, which causes:
--   infinite recursion detected in policy for relation "jobs"

create or replace function has_applied_to_job(p_job_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from applications
    where job_id = p_job_id
      and applicant_id = auth.uid()
  );
$$;

create or replace function is_job_owner(p_job_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from jobs
    where id = p_job_id
      and posted_by = auth.uid()
  );
$$;

revoke all on function has_applied_to_job(uuid) from public;
revoke all on function is_job_owner(uuid) from public;
grant execute on function has_applied_to_job(uuid) to authenticated;
grant execute on function is_job_owner(uuid) to authenticated;

drop policy if exists "Authenticated users can view live or related jobs" on jobs;

create policy "Authenticated users can view live or related jobs"
  on jobs for select
  to authenticated
  using (
    status = 'live'
    or posted_by = auth.uid()
    or has_applied_to_job(id)
  );

drop policy if exists "Applicants can view own applications" on applications;

create policy "Applicants can view own applications"
  on applications for select
  to authenticated
  using (
    applicant_id = auth.uid()
    or is_job_owner(job_id)
  );
