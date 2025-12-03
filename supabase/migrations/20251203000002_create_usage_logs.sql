create table if not exists public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  provider text not null,
  model text not null,
  tokens_in int default 0,
  tokens_out int default 0,
  cost float default 0,
  mode text check (mode in ('auto-power', 'auto-cost', 'manual')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.usage_logs enable row level security;

-- Allow read access for authenticated users (for their own dashboard)
create policy "Users can view usage logs"
on public.usage_logs for select
to authenticated
using (true); -- In a real multi-tenant app, this would be `auth.uid() = user_id`

-- Allow insert access for service role (Edge Functions)
create policy "Service role can insert usage logs"
on public.usage_logs for insert
to service_role
with check (true);
