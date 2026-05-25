import { getSafeRedirectPath } from "./redirects";

describe("getSafeRedirectPath", () => {
  it("allows relative application paths", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
  });

  it("rejects external redirects", () => {
    expect(getSafeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example")).toBe("/dashboard");
  });

  it("rejects malformed redirect values", () => {
    expect(getSafeRedirectPath("/dashboard\nSet-Cookie:bad")).toBe("/dashboard");
  });
});
