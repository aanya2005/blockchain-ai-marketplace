import { assertValidCid, createIpfsUri, createPinataGatewayUrl, isValidCid } from "./cid";

const validCid = `b${"a".repeat(50)}`;

describe("IPFS CID helpers", () => {
  it("validates supported CID formats", () => {
    expect(isValidCid(validCid)).toBe(true);
    expect(createIpfsUri(validCid)).toBe(`ipfs://${validCid}`);
  });

  it("rejects invalid CIDs", () => {
    expect(() => assertValidCid("not-a-cid")).toThrow("invalid IPFS CID");
  });

  it("builds gateway URLs", () => {
    expect(createPinataGatewayUrl(validCid, "https://gateway.example/ipfs/")).toBe(
      `https://gateway.example/ipfs/${validCid}`,
    );
  });
});
