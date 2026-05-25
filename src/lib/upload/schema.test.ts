import { datasetMetadataSchema } from "./schema";

describe("dataset metadata schema", () => {
  it("sanitizes metadata and normalizes tags", () => {
    const result = datasetMetadataSchema.parse({
      title: "  <b>Urban sensors</b>  ",
      description:
        "  <script>bad()</script> A dataset with enough description for validation. ",
      category: "Mobility",
      tags: "Traffic, traffic, Sensors",
      publishState: "published",
    });

    expect(result.title).toBe("bUrban sensors/b");
    expect(result.description).toBe("A dataset with enough description for validation.");
    expect(result.tags).toEqual(["traffic", "sensors"]);
  });

  it("rejects underspecified metadata", () => {
    const result = datasetMetadataSchema.safeParse({
      title: "No",
      description: "Too short",
      category: "Mobility",
      tags: "",
      publishState: "draft",
    });

    expect(result.success).toBe(false);
  });
});
