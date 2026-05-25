import { NextRequest } from "next/server";

import { GET } from "./route";

describe("purchase state API", () => {
  it("requires a dataset ID", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/marketplace/purchase-state"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("DATASET_REQUIRED");
  });
});
