-- Marketplace browsing read policies for approved public datasets.

create policy "Public can read uploaders for approved datasets"
  on public.users for select
  using (
    exists (
      select 1 from public.datasets
      where datasets.uploader_id = users.id
        and datasets.moderation_status = 'approved'::public.dataset_moderation_status
        and datasets.visibility_status = 'public'::public.dataset_visibility_status
    )
  );

create policy "Public can read reputation for approved dataset uploaders"
  on public.reputation_scores for select
  using (
    exists (
      select 1 from public.datasets
      where datasets.uploader_id = reputation_scores.user_id
        and datasets.moderation_status = 'approved'::public.dataset_moderation_status
        and datasets.visibility_status = 'public'::public.dataset_visibility_status
    )
  );

create index datasets_price_idx on public.datasets(price);
create index purchases_completed_dataset_idx on public.purchases(dataset_id)
  where status = 'completed'::public.purchase_status;
