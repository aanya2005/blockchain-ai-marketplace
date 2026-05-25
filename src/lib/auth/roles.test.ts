import type { User } from "@supabase/supabase-js";

import { createAuthIdentity, getDisplayNameFromUser, getRoleFromUser } from "./roles";

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-id",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-05-25T00:00:00.000Z",
    email: "ada@example.com",
    ...overrides,
  } as User;
}

describe("auth role helpers", () => {
  it("reads trusted roles from app metadata", () => {
    const user = createUser({
      app_metadata: {
        role: "admin",
      },
    });

    expect(getRoleFromUser(user)).toBe("admin");
  });

  it("defaults unknown roles to user", () => {
    const user = createUser({
      app_metadata: {
        role: "owner",
      },
    });

    expect(getRoleFromUser(user)).toBe("user");
  });

  it("creates a display identity with wallet structure", () => {
    const user = createUser({
      user_metadata: {
        full_name: " Ada Lovelace ",
      },
    });

    expect(getDisplayNameFromUser(user)).toBe("Ada Lovelace");
    expect(createAuthIdentity(user)).toMatchObject({
      id: "user-id",
      email: "ada@example.com",
      role: "user",
      walletLinks: [],
    });
  });
});
