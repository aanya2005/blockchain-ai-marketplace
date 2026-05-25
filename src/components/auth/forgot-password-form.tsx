"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppOrigin } from "@/lib/auth/config";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/auth/validation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${getAppOrigin()}/auth/reset-password`,
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }

      setSuccessMessage(
        "If an account exists for that email, a reset link is on its way.",
      );
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormMessage message={errorMessage} type="error" />
      <FormMessage message={successMessage} type="success" />

      <div className="space-y-2">
        <Label htmlFor="email">Account email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending reset link..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
