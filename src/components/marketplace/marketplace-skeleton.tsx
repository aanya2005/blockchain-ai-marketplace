export function MarketplaceSkeleton() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading datasets"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-3xl border border-border/70 bg-secondary/30"
        />
      ))}
    </div>
  );
}
