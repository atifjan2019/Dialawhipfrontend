update public.products
set options_json = coalesce(options_json, '{}'::jsonb) || jsonb_build_object(
  'review_count',
  (10 + floor(random() * 641))::integer,
  'rating',
  round((4.6 + random() * 0.4)::numeric, 1)
)
where deleted_at is null;
