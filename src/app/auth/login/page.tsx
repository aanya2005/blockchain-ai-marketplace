import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthFormShell
      eyebrow="Secure access"
      title="Sign in"
      description="Access your NeuroLedger workspace with a Supabase-backed session that persists across refreshes."
    >
      <LoginForm />
    </AuthFormShell>
  );
}
