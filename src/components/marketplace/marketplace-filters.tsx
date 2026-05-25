"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { marketplaceSorts } from "@/lib/marketplace/filters";

type MarketplaceFiltersProps = {
  categories: string[];
};

export function MarketplaceFilters({ categories }: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(formData: FormData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      const text = String(value).trim();
      if (text) {
        params.set(key, text);
      }
    }
    params.set("page", "1");
    startTransition(() => router.push(`/marketplace?${params.toString()}`));
  }

  return (
    <form
      action={update}
      className="grid gap-3 rounded-3xl border border-border/70 bg-card/70 p-4 backdrop-blur lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]"
    >
      <Input
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Search datasets, categories, provenance..."
      />
      <select
        name="category"
        defaultValue={searchParams.get("category") ?? ""}
        className="h-11 rounded-2xl border border-input bg-background/70 px-4 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <Input name="tag" defaultValue={searchParams.get("tag") ?? ""} placeholder="Tag" />
      <select
        name="sort"
        defaultValue={searchParams.get("sort") ?? "newest"}
        className="h-11 rounded-2xl border border-input bg-background/70 px-4 text-sm"
      >
        {marketplaceSorts.map((sort) => (
          <option key={sort} value={sort}>
            {sort.replace("_", " ")}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Filtering..." : "Apply"}
      </Button>
    </form>
  );
}
