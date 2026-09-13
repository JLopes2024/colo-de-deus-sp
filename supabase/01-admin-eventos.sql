-- Execute no SQL Editor do Supabase.

alter table public.eventos
add column if not exists link_ingresso text null;

alter table public.eventos enable row level security;

drop policy if exists "Eventos podem ser lidos publicamente" on public.eventos;
drop policy if exists "Admin pode criar eventos" on public.eventos;
drop policy if exists "Admin pode editar eventos" on public.eventos;
drop policy if exists "Admin pode excluir eventos" on public.eventos;

create policy "Eventos podem ser lidos publicamente"
on public.eventos
for select
to anon, authenticated
using (true);

create policy "Admin pode criar eventos"
on public.eventos
for insert
to authenticated
with check (true);

create policy "Admin pode editar eventos"
on public.eventos
for update
to authenticated
using (true)
with check (true);

create policy "Admin pode excluir eventos"
on public.eventos
for delete
to authenticated
using (true);

create index if not exists idx_eventos_data_evento
on public.eventos (data_evento);
