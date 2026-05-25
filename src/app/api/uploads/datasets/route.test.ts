import { NextRequest } from "next/server";

import { POST } from "./route";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => null),
}));

const mockedCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

describe("dataset upload API", () => {
  it("blocks uploads when Supabase auth is unavailable", async () => {
    mockedCreateSupabaseServerClient.mockResolvedValueOnce(null);
    const request = new NextRequest("http://localhost/api/uploads/datasets", {
      method: "POST",
      body: new FormData(),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error.code).toBe("CONFIGURATION_ERROR");
  });

  it("blocks unauthenticated uploads", async () => {
    mockedCreateSupabaseServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
          error: null,
        })),
      },
    } as never);
    const request = new NextRequest("http://localhost/api/uploads/datasets", {
      method: "POST",
      body: new FormData(),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });
});
