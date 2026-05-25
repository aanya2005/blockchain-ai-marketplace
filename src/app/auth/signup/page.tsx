import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthFormShell
      eyebrow="Join NeuroLedger"
      title="Create account"
      description="Create a secure contributor or buyer account for the decentralized AI data marketplace."
    >
      <SignupForm />
    </AuthFormShell>
  );
}
