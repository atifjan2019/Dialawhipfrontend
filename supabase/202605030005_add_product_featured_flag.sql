alter table public.products
  add column if not exists is_featured boolean not null default false;

with ranked_featured as (
  select
    id,
    row_number() over (order by updated_at desc, created_at desc, id desc) as rn
  from public.products
  where is_featured = true
    and deleted_at is null
)
update public.products p
set is_featured = false
from ranked_featured r
where p.id = r.id
  and r.rn > 1;

create index if not exists products_featured_active_idx
  on public.products(is_featured, is_active)
  where deleted_at is null;

create unique index if not exists products_one_featured_idx
  on public.products((is_featured))
  where is_featured = true
    and deleted_at is null;
