create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('supervisor', 'operador', 'tecnico', 'visualizador')),
  created_at timestamptz not null default now()
);

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  region text,
  team text,
  status text not null default 'disponivel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null unique,
  ticket_number text not null unique,
  customer text not null,
  customer_contact text,
  customer_phone text,
  address text not null,
  city text,
  district text,
  service_type text not null,
  technician text not null,
  assigned_to uuid references public.profiles(id),
  scheduled_at timestamptz not null,
  service_window text,
  priority text not null default 'normal',
  status text not null default 'agendada',
  status_reason text,
  description text,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_name text -- Adicionado para armazenar o nome do criador da atividade
);

create table if not exists public.activity_history (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  status text not null,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_full_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select full_name from public.profiles where id = auth.uid()
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_technicians_updated_at on public.technicians;
create trigger touch_technicians_updated_at
before update on public.technicians
for each row execute function public.touch_updated_at();

drop trigger if exists touch_clients_updated_at on public.clients;
create trigger touch_clients_updated_at
before update on public.clients
for each row execute function public.touch_updated_at();

drop trigger if exists touch_activities_updated_at on public.activities;
create trigger touch_activities_updated_at
before update on public.activities
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.technicians enable row level security;
alter table public.clients enable row level security;
alter table public.activities enable row level security;
alter table public.activity_history enable row level security;

create policy "profiles_read_all_basic" on public.profiles
for select to authenticated
using (true); -- Permite que todos os usuários autenticados leiam perfis (id, full_name, role) para exibição

create policy "profiles_supervisor_write" on public.profiles
for all to authenticated
using (public.current_role() = 'supervisor')
with check (public.current_role() = 'supervisor');

create policy "technicians_read" on public.technicians
for select to authenticated using (true);

create policy "technicians_supervisor_write" on public.technicians
for all to authenticated
using (public.current_role() = 'supervisor')
with check (public.current_role() = 'supervisor');

create policy "clients_read" on public.clients
for select to authenticated using (true);

create policy "clients_supervisor_operator_insert" on public.clients
for insert to authenticated
with check (public.current_role() in ('supervisor', 'operador'));

create policy "clients_supervisor_write" on public.clients
for update to authenticated
using (public.current_role() = 'supervisor')
with check (public.current_role() = 'supervisor');

create policy "clients_supervisor_delete" on public.clients
for delete to authenticated
using (public.current_role() = 'supervisor');

create policy "activities_read" on public.activities
for select to authenticated
using (
  public.current_role() in ('supervisor', 'operador', 'visualizador')
  or assigned_to = auth.uid()
  or (public.current_role() = 'tecnico' and lower(technician) = lower(public.current_full_name()))
  or created_by = auth.uid() -- Adicionado para permitir que o criador veja suas atividades
);

create policy "activities_supervisor_operator_insert" on public.activities
for insert to authenticated
with check (
  public.current_role() in ('supervisor', 'operador')
  and created_by = auth.uid()
  and created_by_name = public.current_full_name() -- Garante que o nome do criador seja preenchido corretamente
);

create policy "activities_update" on public.activities
for update to authenticated
using (
  public.current_role() = 'supervisor'
  or (public.current_role() = 'operador' and created_by = auth.uid())
  or (public.current_role() = 'tecnico' and assigned_to = auth.uid())
  or (public.current_role() = 'tecnico' and lower(technician) = lower(public.current_full_name()))
)
with check (
  public.current_role() = 'supervisor'
  or (public.current_role() = 'operador' and created_by = auth.uid())
  or (public.current_role() = 'tecnico' and assigned_to = auth.uid())
  or (public.current_role() = 'tecnico' and lower(technician) = lower(public.current_full_name()))
  and created_by_name = public.current_full_name() -- Garante que o nome do criador não seja alterado por outros
);

create policy "activities_delete" on public.activities
for delete to authenticated
using (
  public.current_role() = 'supervisor'
  or (public.current_role() = 'operador' and created_by = auth.uid())
);

create policy "history_read" on public.activity_history
for select to authenticated
using (
  exists (
    select 1 from public.activities a
    where a.id = activity_history.activity_id
    and (
      public.current_role() in ('supervisor', 'operador', 'visualizador')
      or a.assigned_to = auth.uid()
      or (public.current_role() = 'tecnico' and lower(a.technician) = lower(public.current_full_name()))
    )
  )
);

create policy "history_insert" on public.activity_history
for insert to authenticated
with check (
  public.current_role() in ('supervisor', 'operador', 'tecnico')
);
