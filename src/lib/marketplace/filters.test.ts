import { parseMarketplaceFilters, sanitizeSearch } from "@/lib/marketplace/filters";

describe("marketplace filters", () => {
  it("sanitizes search input", () => {
    expect(sanitizeSearch("  <script>traffic</script>   sensors ")).toBe(
      "scripttraffic/script sensors",
    );
  });

  it("parses defaults and clamps page size", () => {
    const filters = parseMarketplaceFilters(
      new URLSearchParams("q=mobility&page=3&pageSize=200&sort=popularity"),
    );

    expect(filters).toMatchObject({
      search: "mobility",
      page: 3,
      pageSize: 48,
      sort: "popularity",
    });
  });

  it("falls back from invalid sort values", () => {
    expect(parseMarketplaceFilters(new URLSearchParams("sort=bad")).sort).toBe("newest");
  });
});
