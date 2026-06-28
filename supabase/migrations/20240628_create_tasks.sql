create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table tasks enable row level security;

create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);
