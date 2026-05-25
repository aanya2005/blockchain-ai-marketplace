export const authRateLimitBuckets = {
  login: "auth:login",
  signup: "auth:signup",
  passwordReset: "auth:password-reset",
} as const;

export type AuthRateLimitBucket =
  (typeof authRateLimitBuckets)[keyof typeof authRateLimitBuckets];
