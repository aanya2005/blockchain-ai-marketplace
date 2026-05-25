"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AuthNavigation() {
  const router = useRouter();
  const { identity, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.replace("/auth/login");
    router.refresh();
  }

  if (isLoading) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Checking session...
      </Button>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/signup">Create account</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">
          <span className="hidden sm:inline">{identity.displayName}</span>
          <span className="sm:hidden">Dashboard</span>
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
