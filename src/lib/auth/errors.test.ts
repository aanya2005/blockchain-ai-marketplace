import { getAuthErrorMessage } from "./errors";

describe("getAuthErrorMessage", () => {
  it("maps invalid credentials to a safe user-facing message", () => {
    expect(
      getAuthErrorMessage({
        message: "Invalid login credentials",
      }),
    ).toBe("The email or password is incorrect.");
  });

  it("maps rate limiting errors", () => {
    expect(
      getAuthErrorMessage({
        status: 429,
      }),
    ).toBe("Too many attempts. Please wait before trying again.");
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(getAuthErrorMessage(null)).toBe(
      "We could not complete that authentication request. Please try again.",
    );
  });
});
