import {
  getFileExtension,
  sanitizeFilename,
  sanitizeTags,
  sanitizeTextInput,
} from "./sanitize";

describe("upload sanitization", () => {
  it("removes script tags and angle brackets from metadata", () => {
    expect(sanitizeTextInput("  <script>alert(1)</script> Clean <title>  ")).toBe(
      "Clean title",
    );
  });

  it("normalizes unsafe filenames", () => {
    expect(sanitizeFilename("../../My Dataset (final).csv")).toBe("My-Dataset-final.csv");
    expect(getFileExtension("../../My Dataset (final).csv")).toBe("csv");
  });

  it("deduplicates and bounds tags", () => {
    expect(sanitizeTags([" Mobility ", "mobility", "ai", "x"])).toEqual([
      "mobility",
      "ai",
    ]);
  });
});
