import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      eyebrow="Account recovery"
      title="Forgot password"
      description="Request a secure password reset link for your NeuroLedger account."
    >
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
