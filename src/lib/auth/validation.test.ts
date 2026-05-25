import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./validation";

describe("auth validation schemas", () => {
  it("normalizes login email addresses", () => {
    const result = loginSchema.parse({
      email: " USER@Example.COM ",
      password: "password",
    });

    expect(result.email).toBe("user@example.com");
  });

  it("requires strong matching signup passwords", () => {
    const result = signupSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "weak",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid password reset inputs", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Secure123",
      confirmPassword: "Secure123",
    });

    expect(result.success).toBe(true);
  });

  it("validates forgot password emails", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });
});
