-- NeuroLedger IPFS storage milestone.
-- Adds encrypted Pinata/IPFS storage metadata to dataset records without
-- introducing blockchain ownership or marketplace purchase behavior.

create type public.dataset_storage_provider as enum ('pinata_ipfs');
create type public.dataset_upload_status as enum (
  'pending',
  'encrypting',
  'uploading',
  'stored',
  'failed'
);

alter table public.datasets
  add column storage_provider public.dataset_storage_provider,
  add column upload_status public.dataset_upload_status not null default 'pending',
  add column storage_metadata jsonb not null default '{}'::jsonb,
  add column encryption_metadata jsonb not null default '{}'::jsonb,
  add column encrypted_file_size_bytes bigint,
  add column encrypted_checksum_sha256 text,
  add column pinned_at timestamptz;

alter table public.datasets
  add constraint datasets_storage_metadata_object check (jsonb_typeof(storage_metadata) = 'object'),
  add constraint datasets_encryption_metadata_object check (jsonb_typeof(encryption_metadata) = 'object'),
  add constraint datasets_encrypted_file_size_positive check (
    encrypted_file_size_bytes is null or encrypted_file_size_bytes > 0
  ),
  add constraint datasets_encrypted_checksum_format check (
    encrypted_checksum_sha256 is null or encrypted_checksum_sha256 ~ '^[a-fA-F0-9]{64}$'
  ),
  add constraint datasets_stored_requires_cid check (
    upload_status <> 'stored'::public.dataset_upload_status
    or (
      cid is not null
      and storage_provider is not null
      and encrypted_file_size_bytes is not null
      and encrypted_checksum_sha256 is not null
      and jsonb_typeof(storage_metadata) = 'object'
      and jsonb_typeof(encryption_metadata) = 'object'
      and pinned_at is not null
    )
  );

create index datasets_upload_status_idx on public.datasets(upload_status);
create index datasets_cid_idx on public.datasets(cid) where cid is not null;
create index datasets_storage_metadata_gin_idx on public.datasets using gin(storage_metadata);
