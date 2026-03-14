create table if not exists public.scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  normalized_name text generated always as (
    regexp_replace(lower(btrim(name)), '\s+', ' ', 'g')
  ) stored,
  game_type text not null check (game_type in ('facts', 'pi')),
  score integer not null check (score >= 0),
  detail text check (detail is null or char_length(detail) <= 500),
  created_at timestamptz not null default now(),
  unique (normalized_name, game_type)
);

create index if not exists scores_game_type_score_created_idx
  on public.scores (game_type, score desc, created_at asc);

alter table public.scores enable row level security;

drop policy if exists "public can read scores" on public.scores;
create policy "public can read scores"
on public.scores
for select
to anon
using (true);

drop policy if exists "public can insert scores" on public.scores;
create policy "public can insert scores"
on public.scores
for insert
to anon
with check (true);
