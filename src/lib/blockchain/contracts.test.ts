import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DatasetEscrowAbi } from "@/lib/blockchain/abi/DatasetEscrow";
import { DatasetRegistryAbi } from "@/lib/blockchain/abi/DatasetRegistry";

describe("compiled blockchain contracts", () => {
  it("exports DatasetRegistry ABI and bytecode artifact", () => {
    const artifact = JSON.parse(
      readFileSync(
        join(process.cwd(), "contracts/artifacts/DatasetRegistry.json"),
        "utf8",
      ),
    ) as { bytecode: string };

    expect(DatasetRegistryAbi.some((entry) => entry.type === "event")).toBe(true);
    expect(artifact.bytecode.startsWith("0x")).toBe(true);
    expect(artifact.bytecode.length).toBeGreaterThan(100);
  });

  it("exports DatasetEscrow ABI and bytecode artifact", () => {
    const artifact = JSON.parse(
      readFileSync(join(process.cwd(), "contracts/artifacts/DatasetEscrow.json"), "utf8"),
    ) as { bytecode: string };

    expect(DatasetEscrowAbi.some((entry) => entry.type === "event")).toBe(true);
    expect(artifact.bytecode.startsWith("0x")).toBe(true);
    expect(artifact.bytecode.length).toBeGreaterThan(100);
  });
});
