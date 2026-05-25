import { NextRequest } from "next/server";

import { POST } from "./route";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => null),
}));

const mockedCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

describe("wallet link API", () => {
  it("blocks requests when Supabase is unavailable", async () => {
    mockedCreateSupabaseServerClient.mockResolvedValueOnce(null);
    const request = new NextRequest("http://localhost/api/blockchain/link-wallet", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error.code).toBe("CONFIGURATION_ERROR");
  });
});
