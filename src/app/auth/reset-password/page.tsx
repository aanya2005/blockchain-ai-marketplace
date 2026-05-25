import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <AuthFormShell
      eyebrow="Secure reset"
      title="Reset password"
      description="Set a new password using the recovery session Supabase provides from your reset link."
    >
      <ResetPasswordForm />
    </AuthFormShell>
  );
}
