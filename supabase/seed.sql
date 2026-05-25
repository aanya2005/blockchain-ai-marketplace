-- NeuroLedger local development seed data.
-- Password for seeded accounts: NeuroLedger123

create extension if not exists pgcrypto;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'admin@neuroledger.local',
    crypt('NeuroLedger123', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
    '{"full_name":"NeuroLedger Admin"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'moderator@neuroledger.local',
    crypt('NeuroLedger123', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"],"role":"moderator"}'::jsonb,
    '{"full_name":"NeuroLedger Moderator"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'contributor@neuroledger.local',
    crypt('NeuroLedger123', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"],"role":"user"}'::jsonb,
    '{"full_name":"Dataset Contributor"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-8444-444444444444',
    'authenticated',
    'authenticated',
    'buyer@neuroledger.local',
    crypt('NeuroLedger123', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"],"role":"user"}'::jsonb,
    '{"full_name":"Dataset Buyer"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set
  email = excluded.email,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = timezone('utc', now());

insert into public.users (id, email, display_name, role)
values
  ('11111111-1111-4111-8111-111111111111', 'admin@neuroledger.local', 'NeuroLedger Admin', 'admin'),
  ('22222222-2222-4222-8222-222222222222', 'moderator@neuroledger.local', 'NeuroLedger Moderator', 'moderator'),
  ('33333333-3333-4333-8333-333333333333', 'contributor@neuroledger.local', 'Dataset Contributor', 'user'),
  ('44444444-4444-4444-8444-444444444444', 'buyer@neuroledger.local', 'Dataset Buyer', 'user')
on conflict (id) do update
set
  email = excluded.email,
  display_name = excluded.display_name,
  role = excluded.role,
  updated_at = timezone('utc', now());

insert into public.reputation_scores (user_id, score, completed_uploads, completed_sales, average_rating)
values
  ('33333333-3333-4333-8333-333333333333', 92.50, 4, 12, 4.80),
  ('44444444-4444-4444-8444-444444444444', 70.00, 0, 0, null)
on conflict (user_id) do update
set
  score = excluded.score,
  completed_uploads = excluded.completed_uploads,
  completed_sales = excluded.completed_sales,
  average_rating = excluded.average_rating,
  updated_at = timezone('utc', now());

insert into public.wallet_links (
  id,
  user_id,
  wallet_address,
  chain_id,
  is_primary,
  verified_at
)
values (
  '55555555-5555-4555-8555-555555555555',
  '33333333-3333-4333-8333-333333333333',
  '0x1111111111111111111111111111111111111111',
  84532,
  true,
  timezone('utc', now())
)
on conflict (user_id, wallet_address, chain_id) do update
set
  is_primary = excluded.is_primary,
  verified_at = excluded.verified_at,
  updated_at = timezone('utc', now());

insert into public.datasets (
  id,
  uploader_id,
  title,
  description,
  tags,
  category,
  file_name,
  file_size_bytes,
  file_mime_type,
  file_checksum_sha256,
  row_count,
  column_count,
  validation_score,
  cid,
  blockchain_hash,
  price,
  currency,
  visibility_status,
  moderation_status,
  published_at
)
values
  (
    '66666666-6666-4666-8666-666666666666',
    '33333333-3333-4333-8333-333333333333',
    'Urban Mobility Sensor Dataset',
    'An approved sample dataset describing anonymized urban traffic sensor observations for local development.',
    array['mobility', 'sensors', 'urban'],
    'Mobility',
    'urban-mobility.csv',
    204800,
    'text/csv',
    repeat('a', 64),
    1200,
    18,
    94.25,
    'ipfs-cid-placeholder',
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    0.050000,
    'ETH',
    'public',
    'approved',
    timezone('utc', now())
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    '33333333-3333-4333-8333-333333333333',
    'Draft Healthcare Benchmark Dataset',
    'A draft dataset record used to verify owner-only visibility and moderation workflows during local development.',
    array['healthcare', 'benchmark'],
    'Healthcare',
    'healthcare-benchmark.jsonl',
    102400,
    'application/jsonl',
    repeat('b', 64),
    400,
    24,
    81.50,
    null,
    null,
    0.075000,
    'ETH',
    'draft',
    'pending',
    null
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  tags = excluded.tags,
  category = excluded.category,
  validation_score = excluded.validation_score,
  visibility_status = excluded.visibility_status,
  moderation_status = excluded.moderation_status,
  updated_at = timezone('utc', now());

insert into public.transactions (
  id,
  actor_id,
  dataset_id,
  transaction_type,
  status,
  chain_id,
  tx_hash,
  amount,
  currency
)
values (
  '88888888-8888-4888-8888-888888888888',
  '44444444-4444-4444-8444-444444444444',
  '66666666-6666-4666-8666-666666666666',
  'dataset_purchase',
  'confirmed',
  84532,
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  0.050000,
  'ETH'
)
on conflict (id) do update
set
  status = excluded.status,
  updated_at = timezone('utc', now());

insert into public.purchases (
  id,
  buyer_id,
  dataset_id,
  transaction_id,
  status,
  purchased_at
)
values (
  '99999999-9999-4999-8999-999999999999',
  '44444444-4444-4444-8444-444444444444',
  '66666666-6666-4666-8666-666666666666',
  '88888888-8888-4888-8888-888888888888',
  'completed',
  timezone('utc', now())
)
on conflict (id) do update
set
  status = excluded.status,
  purchased_at = excluded.purchased_at,
  updated_at = timezone('utc', now());

insert into public.bounties (
  id,
  creator_id,
  title,
  description,
  tags,
  category,
  budget,
  currency,
  deadline,
  status
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '44444444-4444-4444-8444-444444444444',
  'Anonymized Energy Demand Dataset',
  'Seeking a privacy-preserving energy demand dataset with hourly readings and clear provenance metadata.',
  array['energy', 'forecasting'],
  'Energy',
  0.250000,
  'ETH',
  timezone('utc', now()) + interval '30 days',
  'open'
)
on conflict (id) do update
set
  title = excluded.title,
  status = excluded.status,
  updated_at = timezone('utc', now());

insert into public.notifications (id, user_id, type, title, body)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '33333333-3333-4333-8333-333333333333',
  'system',
  'Welcome to NeuroLedger',
  'Your local seed account is ready for Phase 3 database verification.'
)
on conflict (id) do update
set
  title = excluded.title,
  body = excluded.body,
  updated_at = timezone('utc', now());
