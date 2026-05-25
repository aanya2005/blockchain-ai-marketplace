import { redirect } from "next/navigation";

import { DatasetUploadForm } from "@/components/upload/dataset-upload-form";
import { PageShell } from "@/components/layout/page-shell";
import { getServerAuthUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Upload",
};

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/upload");
  }

  return (
    <PageShell
      eyebrow="Secure upload"
      title="Dataset upload"
      description="Validate dataset metadata and files, store upload metadata in Supabase, and prepare local temporary storage for the later IPFS phase."
    >
      <DatasetUploadForm />
    </PageShell>
  );
}
