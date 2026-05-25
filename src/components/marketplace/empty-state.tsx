import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <SearchX className="size-12 text-primary" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-bold">{title}</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
