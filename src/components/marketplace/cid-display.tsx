import { truncateCid } from "@/lib/marketplace/format";

type CidDisplayProps = {
  cid: string | null;
};

export function CidDisplay({ cid }: CidDisplayProps) {
  if (!cid) {
    return <span className="text-muted-foreground">CID pending</span>;
  }

  return (
    <code className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-primary">
      {truncateCid(cid)}
    </code>
  );
}
