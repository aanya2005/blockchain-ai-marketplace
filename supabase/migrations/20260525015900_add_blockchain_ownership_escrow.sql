-- NeuroLedger blockchain ownership and escrow milestone.
-- Adds persistence for on-chain dataset registration, escrow purchases, and
-- contract event synchronization without introducing marketplace UI workflows.

create type public.dataset_ownership_status as enum ('pending', 'registered', 'failed');
create type public.escrow_state_status as enum ('funded', 'released', 'refunded', 'failed');

alter table public.datasets
  add column registry_chain_id integer,
  add column registry_contract_address text,
  add column registry_dataset_id text,
  add column registry_transaction_hash text,
  add column registered_on_chain_at timestamptz;

alter table public.datasets
  add constraint datasets_registry_chain_positive check (
    registry_chain_id is null or registry_chain_id > 0
  ),
  add constraint datasets_registry_contract_format check (
    registry_contract_address is null or registry_contract_address ~ '^0x[a-fA-F0-9]{40}$'
  ),
  add constraint datasets_registry_dataset_id_format check (
    registry_dataset_id is null or registry_dataset_id ~ '^0x[a-fA-F0-9]{64}$'
  ),
  add constraint datasets_registry_transaction_format check (
    registry_transaction_hash is null or registry_transaction_hash ~ '^0x[a-fA-F0-9]{64}$'
  );

alter table public.transactions
  add column from_wallet_address text,
  add column to_wallet_address text,
  add column contract_address text,
  add column related_purchase_id uuid references public.purchases(id) on delete set null;

alter table public.transactions
  add constraint transactions_from_wallet_format check (
    from_wallet_address is null or from_wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  ),
  add constraint transactions_to_wallet_format check (
    to_wallet_address is null or to_wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  ),
  add constraint transactions_contract_format check (
    contract_address is null or contract_address ~ '^0x[a-fA-F0-9]{40}$'
  );

create table public.dataset_ownerships (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null unique references public.datasets(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete restrict,
  wallet_address text not null,
  chain_id integer not null,
  registry_contract_address text not null,
  registry_dataset_id text not null unique,
  dataset_hash text not null,
  cid text not null,
  transaction_hash text not null unique,
  status public.dataset_ownership_status not null default 'pending',
  registered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint dataset_ownerships_wallet_format check (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint dataset_ownerships_chain_positive check (chain_id > 0),
  constraint dataset_ownerships_contract_format check (registry_contract_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint dataset_ownerships_dataset_id_format check (registry_dataset_id ~ '^0x[a-fA-F0-9]{64}$'),
  constraint dataset_ownerships_hash_format check (dataset_hash ~ '^0x[a-fA-F0-9]{64}$'),
  constraint dataset_ownerships_tx_format check (transaction_hash ~ '^0x[a-fA-F0-9]{64}$')
);

create table public.escrow_states (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid unique references public.purchases(id) on delete set null,
  dataset_id uuid not null references public.datasets(id) on delete restrict,
  buyer_id uuid not null references public.users(id) on delete restrict,
  seller_id uuid not null references public.users(id) on delete restrict,
  buyer_wallet_address text not null,
  seller_wallet_address text not null,
  chain_id integer not null,
  escrow_contract_address text not null,
  escrow_purchase_id text not null unique,
  fund_transaction_hash text not null unique,
  release_transaction_hash text unique,
  amount_wei text not null,
  status public.escrow_state_status not null default 'funded',
  funded_at timestamptz not null default timezone('utc', now()),
  released_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint escrow_states_buyer_wallet_format check (buyer_wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint escrow_states_seller_wallet_format check (seller_wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint escrow_states_chain_positive check (chain_id > 0),
  constraint escrow_states_contract_format check (escrow_contract_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint escrow_states_purchase_id_format check (escrow_purchase_id ~ '^0x[a-fA-F0-9]{64}$'),
  constraint escrow_states_fund_tx_format check (fund_transaction_hash ~ '^0x[a-fA-F0-9]{64}$'),
  constraint escrow_states_release_tx_format check (
    release_transaction_hash is null or release_transaction_hash ~ '^0x[a-fA-F0-9]{64}$'
  ),
  constraint escrow_states_amount_numeric check (amount_wei ~ '^[0-9]+$'),
  constraint escrow_states_no_self_purchase check (buyer_id <> seller_id)
);

create table public.blockchain_events (
  id uuid primary key default gen_random_uuid(),
  chain_id integer not null,
  contract_address text not null,
  event_name text not null,
  transaction_hash text not null,
  log_index integer not null,
  block_number bigint not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint blockchain_events_chain_positive check (chain_id > 0),
  constraint blockchain_events_contract_format check (contract_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint blockchain_events_tx_format check (transaction_hash ~ '^0x[a-fA-F0-9]{64}$'),
  constraint blockchain_events_log_index_nonnegative check (log_index >= 0),
  constraint blockchain_events_block_positive check (block_number > 0),
  constraint blockchain_events_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint blockchain_events_unique_log unique (transaction_hash, log_index)
);

create index datasets_registry_dataset_id_idx on public.datasets(registry_dataset_id) where registry_dataset_id is not null;
create index transactions_related_purchase_idx on public.transactions(related_purchase_id);
create index dataset_ownerships_owner_idx on public.dataset_ownerships(owner_id);
create index dataset_ownerships_dataset_idx on public.dataset_ownerships(dataset_id);
create index dataset_ownerships_status_idx on public.dataset_ownerships(status);
create index escrow_states_buyer_idx on public.escrow_states(buyer_id);
create index escrow_states_seller_idx on public.escrow_states(seller_id);
create index escrow_states_dataset_idx on public.escrow_states(dataset_id);
create index escrow_states_status_idx on public.escrow_states(status);
create index blockchain_events_contract_idx on public.blockchain_events(chain_id, contract_address);
create index blockchain_events_processed_idx on public.blockchain_events(processed_at) where processed_at is null;

create trigger dataset_ownerships_set_updated_at before update on public.dataset_ownerships for each row execute function public.set_updated_at();
create trigger escrow_states_set_updated_at before update on public.escrow_states for each row execute function public.set_updated_at();

alter table public.dataset_ownerships enable row level security;
alter table public.escrow_states enable row level security;
alter table public.blockchain_events enable row level security;

create policy "Owners and moderators can read dataset ownerships"
  on public.dataset_ownerships for select
  using (owner_id = auth.uid() or public.is_admin_or_moderator());

create policy "Dataset owners can create pending ownership records"
  on public.dataset_ownerships for insert
  with check (
    owner_id = auth.uid()
    and status in ('pending'::public.dataset_ownership_status, 'registered'::public.dataset_ownership_status)
    and exists (
      select 1 from public.datasets
      where datasets.id = dataset_ownerships.dataset_id
        and datasets.uploader_id = auth.uid()
    )
  );

create policy "Owners and moderators can update dataset ownerships"
  on public.dataset_ownerships for update
  using (owner_id = auth.uid() or public.is_admin_or_moderator())
  with check (owner_id = auth.uid() or public.is_admin_or_moderator());

create policy "Admins can delete dataset ownerships"
  on public.dataset_ownerships for delete
  using (public.is_admin());

create policy "Escrow participants and moderators can read escrow states"
  on public.escrow_states for select
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin_or_moderator()
  );

create policy "Buyers can create funded escrow states"
  on public.escrow_states for insert
  with check (buyer_id = auth.uid() and status = 'funded'::public.escrow_state_status);

create policy "Escrow participants and moderators can update escrow states"
  on public.escrow_states for update
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin_or_moderator()
  )
  with check (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin_or_moderator()
  );

create policy "Admins can delete escrow states"
  on public.escrow_states for delete
  using (public.is_admin());

create policy "Users can insert own blockchain transactions"
  on public.transactions for insert
  with check (
    actor_id = auth.uid()
    and transaction_type in (
      'dataset_registration'::public.transaction_type,
      'dataset_purchase'::public.transaction_type
    )
  );

create policy "Moderators can read blockchain events"
  on public.blockchain_events for select
  using (public.is_admin_or_moderator());

create policy "Moderators can insert blockchain events"
  on public.blockchain_events for insert
  with check (public.is_admin_or_moderator());

create policy "Moderators can update blockchain events"
  on public.blockchain_events for update
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

grant select, insert, update, delete on public.dataset_ownerships, public.escrow_states, public.blockchain_events to authenticated;
