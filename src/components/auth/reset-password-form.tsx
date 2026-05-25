"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/auth/validation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPreparingSession, setIsPreparingSession] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      try {
        const supabase = createSupabaseBrowserClient();
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error && isMounted) {
            setErrorMessage(getAuthErrorMessage(error));
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getAuthErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsPreparingSession(false);
        }
      }
    }

    void prepareRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(values: ResetPasswordFormValues) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }

      setSuccessMessage("Your password has been updated. Redirecting...");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  }

  const isDisabled = isPreparingSession || isSubmitting;

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormMessage message={errorMessage} type="error" />
      <FormMessage message={successMessage} type="success" />

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          disabled={isDisabled}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          disabled={isDisabled}
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isDisabled}>
        {isPreparingSession
          ? "Preparing secure session..."
          : isSubmitting
            ? "Updating password..."
            : "Update password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already updated it?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
