-- NeuroLedger Phase 3 core database schema.
-- This migration creates all application tables, constraints, indexes, triggers,
-- and Row Level Security policies required before feature workflows are built.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('user', 'admin', 'moderator');
create type public.dataset_visibility_status as enum ('draft', 'private', 'public', 'unlisted', 'archived');
create type public.dataset_moderation_status as enum ('pending', 'approved', 'rejected', 'flagged', 'removed');
create type public.purchase_status as enum ('pending', 'completed', 'failed', 'refunded', 'cancelled');
create type public.transaction_type as enum ('dataset_registration', 'dataset_purchase', 'bounty_funding', 'bounty_payout', 'refund', 'admin_adjustment');
create type public.transaction_status as enum ('pending', 'submitted', 'confirmed', 'failed', 'cancelled');
create type public.bounty_status as enum ('draft', 'open', 'in_review', 'awarded', 'cancelled', 'expired');
create type public.submission_status as enum ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn');
create type public.notification_type as enum ('system', 'dataset', 'purchase', 'bounty', 'submission', 'moderation', 'security');
create type public.report_target_type as enum ('dataset', 'review', 'bounty', 'submission', 'user');
create type public.report_status as enum ('open', 'investigating', 'resolved', 'dismissed');
create type public.admin_action_type as enum ('user_role_updated', 'user_banned', 'user_unbanned', 'dataset_approved', 'dataset_rejected', 'dataset_removed', 'report_resolved', 'bounty_cancelled');

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
set search_path = public
as $$
  select case
    when auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'moderator', 'user')
      then (auth.jwt() -> 'app_metadata' ->> 'role')::public.app_role
    else 'user'::public.app_role
  end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() = 'admin'::public.app_role;
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() = 'moderator'::public.app_role;
$$;

create or replace function public.is_admin_or_moderator()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() in ('admin'::public.app_role, 'moderator'::public.app_role);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  display_name text,
  avatar_url text,
  bio text,
  role public.app_role not null default 'user',
  banned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_display_name_length check (display_name is null or char_length(display_name) between 2 and 120),
  constraint users_bio_length check (bio is null or char_length(bio) <= 500),
  constraint users_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 2048)
);

create table public.wallet_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_address text not null,
  chain_id integer not null,
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint wallet_links_chain_positive check (chain_id > 0),
  constraint wallet_links_address_format check (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint wallet_links_unique_wallet_per_user unique (user_id, wallet_address, chain_id)
);

create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  category text not null,
  file_name text not null,
  file_size_bytes bigint not null,
  file_mime_type text not null,
  file_checksum_sha256 text,
  row_count bigint,
  column_count integer,
  validation_score numeric(5, 2),
  cid text,
  blockchain_hash text,
  price numeric(18, 6) not null default 0,
  currency text not null default 'ETH',
  visibility_status public.dataset_visibility_status not null default 'draft',
  moderation_status public.dataset_moderation_status not null default 'pending',
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint datasets_title_length check (char_length(title) between 3 and 140),
  constraint datasets_description_length check (char_length(description) between 20 and 5000),
  constraint datasets_category_length check (char_length(category) between 2 and 80),
  constraint datasets_file_name_length check (char_length(file_name) between 1 and 255),
  constraint datasets_file_size_positive check (file_size_bytes > 0),
  constraint datasets_checksum_format check (file_checksum_sha256 is null or file_checksum_sha256 ~ '^[a-fA-F0-9]{64}$'),
  constraint datasets_row_count_nonnegative check (row_count is null or row_count >= 0),
  constraint datasets_column_count_nonnegative check (column_count is null or column_count >= 0),
  constraint datasets_validation_score_range check (validation_score is null or validation_score between 0 and 100),
  constraint datasets_price_nonnegative check (price >= 0),
  constraint datasets_tags_reasonable check (array_length(tags, 1) is null or array_length(tags, 1) <= 20),
  constraint datasets_public_requires_approval check (
    visibility_status <> 'public'::public.dataset_visibility_status
    or moderation_status = 'approved'::public.dataset_moderation_status
  )
);

create table public.bounties (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  category text not null,
  budget numeric(18, 6) not null,
  currency text not null default 'ETH',
  deadline timestamptz not null,
  status public.bounty_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bounties_title_length check (char_length(title) between 3 and 160),
  constraint bounties_description_length check (char_length(description) between 20 and 5000),
  constraint bounties_category_length check (char_length(category) between 2 and 80),
  constraint bounties_budget_positive check (budget > 0),
  constraint bounties_deadline_future check (deadline > created_at),
  constraint bounties_tags_reasonable check (array_length(tags, 1) is null or array_length(tags, 1) <= 20)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  dataset_id uuid references public.datasets(id) on delete set null,
  bounty_id uuid references public.bounties(id) on delete set null,
  transaction_type public.transaction_type not null,
  status public.transaction_status not null default 'pending',
  chain_id integer,
  tx_hash text unique,
  amount numeric(18, 6),
  currency text not null default 'ETH',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transactions_chain_positive check (chain_id is null or chain_id > 0),
  constraint transactions_hash_format check (tx_hash is null or tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
  constraint transactions_amount_nonnegative check (amount is null or amount >= 0),
  constraint transactions_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id) on delete restrict,
  dataset_id uuid not null references public.datasets(id) on delete restrict,
  transaction_id uuid unique references public.transactions(id) on delete set null,
  status public.purchase_status not null default 'pending',
  purchased_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid not null references public.bounties(id) on delete cascade,
  dataset_id uuid not null references public.datasets(id) on delete restrict,
  contributor_id uuid not null references public.users(id) on delete restrict,
  status public.submission_status not null default 'submitted',
  note text,
  reward_transaction_id uuid references public.transactions(id) on delete set null,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint submissions_note_length check (note is null or char_length(note) <= 2000),
  constraint submissions_unique_dataset_per_bounty unique (bounty_id, dataset_id, contributor_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete restrict,
  purchase_id uuid references public.purchases(id) on delete set null,
  rating integer not null,
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_comment_length check (comment is null or char_length(comment) <= 2000),
  constraint reviews_one_per_dataset unique (dataset_id, reviewer_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null default 'system',
  title text not null,
  body text not null,
  is_read boolean not null default false,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notifications_title_length check (char_length(title) between 1 and 160),
  constraint notifications_body_length check (char_length(body) between 1 and 2000),
  constraint notifications_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.reputation_scores (
  user_id uuid primary key references public.users(id) on delete cascade,
  score numeric(6, 2) not null default 0,
  completed_uploads integer not null default 0,
  completed_sales integer not null default 0,
  average_rating numeric(3, 2),
  bounty_acceptances integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reputation_score_range check (score between 0 and 100),
  constraint reputation_uploads_nonnegative check (completed_uploads >= 0),
  constraint reputation_sales_nonnegative check (completed_sales >= 0),
  constraint reputation_bounty_acceptances_nonnegative check (bounty_acceptances >= 0),
  constraint reputation_average_rating_range check (average_rating is null or average_rating between 1 and 5)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id) on delete set null,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  assigned_to uuid references public.users(id) on delete set null,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reports_reason_length check (char_length(reason) between 3 and 160),
  constraint reports_details_length check (details is null or char_length(details) <= 3000),
  constraint reports_resolution_length check (resolution is null or char_length(resolution) <= 3000)
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.users(id) on delete restrict,
  action_type public.admin_action_type not null,
  target_type public.report_target_type,
  target_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint admin_actions_reason_length check (reason is null or char_length(reason) <= 2000),
  constraint admin_actions_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index users_role_idx on public.users(role);
create index users_email_idx on public.users(email);
create index wallet_links_user_idx on public.wallet_links(user_id);
create unique index wallet_links_one_primary_per_user_idx on public.wallet_links(user_id) where is_primary;
create index datasets_uploader_idx on public.datasets(uploader_id);
create index datasets_marketplace_idx on public.datasets(moderation_status, visibility_status, created_at desc);
create index datasets_category_idx on public.datasets(category);
create index datasets_tags_gin_idx on public.datasets using gin(tags);
create index datasets_created_at_idx on public.datasets(created_at desc);
create index purchases_buyer_idx on public.purchases(buyer_id);
create index purchases_dataset_idx on public.purchases(dataset_id);
create unique index purchases_unique_active_idx on public.purchases(buyer_id, dataset_id) where status in ('pending', 'completed');
create index transactions_actor_idx on public.transactions(actor_id);
create index transactions_dataset_idx on public.transactions(dataset_id);
create index transactions_bounty_idx on public.transactions(bounty_id);
create index transactions_status_idx on public.transactions(status);
create index bounties_creator_idx on public.bounties(creator_id);
create index bounties_status_deadline_idx on public.bounties(status, deadline);
create index bounties_tags_gin_idx on public.bounties using gin(tags);
create index submissions_bounty_idx on public.submissions(bounty_id);
create index submissions_contributor_idx on public.submissions(contributor_id);
create index submissions_dataset_idx on public.submissions(dataset_id);
create index reviews_dataset_idx on public.reviews(dataset_id);
create index reviews_reviewer_idx on public.reviews(reviewer_id);
create index notifications_user_unread_idx on public.notifications(user_id, is_read, created_at desc);
create index reports_status_idx on public.reports(status);
create index reports_reporter_idx on public.reports(reporter_id);
create index admin_actions_admin_idx on public.admin_actions(admin_id);
create index admin_actions_target_idx on public.admin_actions(target_type, target_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.users.display_name, excluded.display_name),
        updated_at = timezone('utc', now());

  insert into public.reputation_scores (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.prevent_user_role_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'authenticated'
    and old.role is distinct from new.role
    and not public.is_admin()
  then
    raise exception 'Only admins can change user roles.';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_dataset_moderation_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'authenticated'
    and not public.is_admin_or_moderator()
    and (
      old.uploader_id is distinct from new.uploader_id
      or old.moderation_status is distinct from new.moderation_status
      or new.visibility_status = 'public'::public.dataset_visibility_status
         and old.visibility_status is distinct from new.visibility_status
    )
  then
    raise exception 'Only moderators can change protected dataset fields.';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_self_purchase()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1 from public.datasets
    where datasets.id = new.dataset_id
      and datasets.uploader_id = new.buyer_id
  ) then
    raise exception 'Dataset uploaders cannot purchase their own datasets.';
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger users_prevent_role_escalation before update on public.users for each row execute function public.prevent_user_role_escalation();
create trigger wallet_links_set_updated_at before update on public.wallet_links for each row execute function public.set_updated_at();
create trigger datasets_set_updated_at before update on public.datasets for each row execute function public.set_updated_at();
create trigger datasets_prevent_moderation_escalation before update on public.datasets for each row execute function public.prevent_dataset_moderation_escalation();
create trigger purchases_prevent_self_purchase before insert or update on public.purchases for each row execute function public.prevent_self_purchase();
create trigger purchases_set_updated_at before update on public.purchases for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger bounties_set_updated_at before update on public.bounties for each row execute function public.set_updated_at();
create trigger submissions_set_updated_at before update on public.submissions for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger reputation_scores_set_updated_at before update on public.reputation_scores for each row execute function public.set_updated_at();
create trigger reports_set_updated_at before update on public.reports for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.wallet_links enable row level security;
alter table public.datasets enable row level security;
alter table public.purchases enable row level security;
alter table public.transactions enable row level security;
alter table public.bounties enable row level security;
alter table public.submissions enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.reputation_scores enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;

create policy "Users can read own profile; moderators can read all"
  on public.users for select
  using (id = auth.uid() or public.is_admin_or_moderator());

create policy "Users can insert own profile with safe role"
  on public.users for insert
  with check (id = auth.uid() and role = 'user'::public.app_role);

create policy "Users can update own profile; admins can update all"
  on public.users for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Admins can delete users"
  on public.users for delete
  using (public.is_admin());

create policy "Users manage own wallet links"
  on public.wallet_links for all
  using (user_id = auth.uid() or public.is_admin_or_moderator())
  with check (user_id = auth.uid() or public.is_admin_or_moderator());

create policy "Approved public datasets are browsable"
  on public.datasets for select
  using (
    moderation_status = 'approved'::public.dataset_moderation_status
    and visibility_status = 'public'::public.dataset_visibility_status
  );

create policy "Dataset owners and moderators can read datasets"
  on public.datasets for select
  using (uploader_id = auth.uid() or public.is_admin_or_moderator());

create policy "Authenticated users can create own datasets"
  on public.datasets for insert
  with check (uploader_id = auth.uid() and moderation_status = 'pending'::public.dataset_moderation_status);

create policy "Dataset owners and moderators can update datasets"
  on public.datasets for update
  using (uploader_id = auth.uid() or public.is_admin_or_moderator())
  with check (uploader_id = auth.uid() or public.is_admin_or_moderator());

create policy "Dataset owners and moderators can delete datasets"
  on public.datasets for delete
  using (uploader_id = auth.uid() or public.is_admin_or_moderator());

create policy "Relevant users can read purchases"
  on public.purchases for select
  using (
    buyer_id = auth.uid()
    or public.is_admin_or_moderator()
    or exists (
      select 1 from public.datasets
      where datasets.id = purchases.dataset_id
        and datasets.uploader_id = auth.uid()
    )
  );

create policy "Buyers can create pending purchases"
  on public.purchases for insert
  with check (buyer_id = auth.uid() and status = 'pending'::public.purchase_status);

create policy "Only moderators can update purchases"
  on public.purchases for update
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "Only admins can delete purchases"
  on public.purchases for delete
  using (public.is_admin());

create policy "Relevant users can read transactions"
  on public.transactions for select
  using (
    actor_id = auth.uid()
    or public.is_admin_or_moderator()
    or exists (
      select 1 from public.datasets
      where datasets.id = transactions.dataset_id
        and datasets.uploader_id = auth.uid()
    )
    or exists (
      select 1 from public.bounties
      where bounties.id = transactions.bounty_id
        and bounties.creator_id = auth.uid()
    )
  );

create policy "Only moderators can insert transactions"
  on public.transactions for insert
  with check (public.is_admin_or_moderator());

create policy "Only moderators can update transactions"
  on public.transactions for update
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "Open bounties are browsable"
  on public.bounties for select
  using (status = 'open'::public.bounty_status);

create policy "Bounty creators and moderators can read bounties"
  on public.bounties for select
  using (creator_id = auth.uid() or public.is_admin_or_moderator());

create policy "Authenticated users can create own bounties"
  on public.bounties for insert
  with check (creator_id = auth.uid());

create policy "Bounty creators and moderators can update bounties"
  on public.bounties for update
  using (creator_id = auth.uid() or public.is_admin_or_moderator())
  with check (creator_id = auth.uid() or public.is_admin_or_moderator());

create policy "Bounty creators and admins can delete bounties"
  on public.bounties for delete
  using (creator_id = auth.uid() or public.is_admin());

create policy "Relevant users can read submissions"
  on public.submissions for select
  using (
    contributor_id = auth.uid()
    or public.is_admin_or_moderator()
    or exists (
      select 1 from public.bounties
      where bounties.id = submissions.bounty_id
        and bounties.creator_id = auth.uid()
    )
  );

create policy "Contributors can create own submissions"
  on public.submissions for insert
  with check (contributor_id = auth.uid());

create policy "Bounty creators and moderators can update submissions"
  on public.submissions for update
  using (
    public.is_admin_or_moderator()
    or exists (
      select 1 from public.bounties
      where bounties.id = submissions.bounty_id
        and bounties.creator_id = auth.uid()
    )
  )
  with check (
    public.is_admin_or_moderator()
    or exists (
      select 1 from public.bounties
      where bounties.id = submissions.bounty_id
        and bounties.creator_id = auth.uid()
    )
  );

create policy "Contributors and admins can delete submissions"
  on public.submissions for delete
  using (contributor_id = auth.uid() or public.is_admin());

create policy "Approved dataset reviews are browsable"
  on public.reviews for select
  using (
    public.is_admin_or_moderator()
    or reviewer_id = auth.uid()
    or exists (
      select 1 from public.datasets
      where datasets.id = reviews.dataset_id
        and (
          datasets.uploader_id = auth.uid()
          or (
            datasets.moderation_status = 'approved'::public.dataset_moderation_status
            and datasets.visibility_status = 'public'::public.dataset_visibility_status
          )
        )
    )
  );

create policy "Verified buyers can create reviews"
  on public.reviews for insert
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.purchases
      where purchases.dataset_id = reviews.dataset_id
        and purchases.buyer_id = auth.uid()
        and purchases.status = 'completed'::public.purchase_status
    )
  );

create policy "Reviewers can update own reviews"
  on public.reviews for update
  using (reviewer_id = auth.uid() or public.is_admin_or_moderator())
  with check (reviewer_id = auth.uid() or public.is_admin_or_moderator());

create policy "Reviewers and moderators can delete reviews"
  on public.reviews for delete
  using (reviewer_id = auth.uid() or public.is_admin_or_moderator());

create policy "Users can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin_or_moderator());

create policy "Users can update own notification read state"
  on public.notifications for update
  using (user_id = auth.uid() or public.is_admin_or_moderator())
  with check (user_id = auth.uid() or public.is_admin_or_moderator());

create policy "Moderators can create notifications"
  on public.notifications for insert
  with check (public.is_admin_or_moderator());

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin());

create policy "Users can read own reputation"
  on public.reputation_scores for select
  using (user_id = auth.uid() or public.is_admin_or_moderator());

create policy "Only moderators can update reputation"
  on public.reputation_scores for update
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "Users can create own reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

create policy "Reporters and moderators can read reports"
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin_or_moderator());

create policy "Only moderators can update reports"
  on public.reports for update
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "Only admins can delete reports"
  on public.reports for delete
  using (public.is_admin());

create policy "Moderators can read admin actions"
  on public.admin_actions for select
  using (public.is_admin_or_moderator());

create policy "Moderators can create admin actions"
  on public.admin_actions for insert
  with check (public.is_admin_or_moderator() and admin_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.datasets, public.reviews, public.bounties to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
