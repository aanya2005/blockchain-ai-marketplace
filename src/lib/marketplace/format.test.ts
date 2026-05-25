import {
  formatCompactNumber,
  formatDatasetPrice,
  truncateCid,
} from "@/lib/marketplace/format";

describe("marketplace formatting", () => {
  it("truncates long CIDs safely", () => {
    expect(truncateCid("bafybeigdyrztlongcidvalue", 4)).toBe("bafy...alue");
  });

  it("formats dataset prices", () => {
    expect(formatDatasetPrice(0, "ETH")).toBe("Free");
    expect(formatDatasetPrice(0.125, "ETH")).toBe("0.125 ETH");
  });

  it("formats compact numbers", () => {
    expect(formatCompactNumber(1200)).toBe("1.2K");
  });
});
