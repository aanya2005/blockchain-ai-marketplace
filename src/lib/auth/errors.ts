type AuthErrorLike = {
  message?: string;
  status?: number;
  code?: string;
};

const fallbackAuthError =
  "We could not complete that authentication request. Please try again.";

export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return fallbackAuthError;
  }

  const authError = error as AuthErrorLike;
  const message = authError.message?.trim();
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (normalizedMessage.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists")
  ) {
    return "An account already exists for this email address.";
  }

  if (
    normalizedMessage.includes("password should") ||
    normalizedMessage.includes("weak password")
  ) {
    return "Choose a stronger password that meets the listed requirements.";
  }

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many")
  ) {
    return "Too many attempts. Please wait before trying again.";
  }

  if (normalizedMessage.includes("same password")) {
    return "Choose a password that is different from your current password.";
  }

  if (authError.status === 429) {
    return "Too many attempts. Please wait before trying again.";
  }

  return message || fallbackAuthError;
}
