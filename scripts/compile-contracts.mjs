import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { format } from "prettier";
import solc from "solc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");
const contractNames = ["DatasetRegistry", "DatasetEscrow"];

const sources = Object.fromEntries(
  await Promise.all(
    contractNames.map(async (contractName) => {
      const fileName = `${contractName}.sol`;
      return [
        fileName,
        {
          content: await readFile(join(root, "contracts", fileName), "utf8"),
        },
      ];
    }),
  ),
);

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors ?? [];
const fatalErrors = errors.filter((error) => error.severity === "error");

for (const error of errors) {
  const log = error.severity === "error" ? console.error : console.warn;
  log(error.formattedMessage);
}

if (fatalErrors.length > 0) {
  process.exit(1);
}

const artifactDirectory = join(root, "contracts", "artifacts");
const abiDirectory = join(root, "src", "lib", "blockchain", "abi");
await mkdir(artifactDirectory, { recursive: true });
await mkdir(abiDirectory, { recursive: true });

for (const contractName of contractNames) {
  const compiled = output.contracts[`${contractName}.sol`][contractName];
  const artifact = {
    contractName,
    abi: compiled.abi,
    bytecode: `0x${compiled.evm.bytecode.object}`,
    deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`,
    compiler: solc.version(),
  };

  await writeFile(
    join(artifactDirectory, `${contractName}.json`),
    `${JSON.stringify(artifact, null, 2)}\n`,
  );
  const abiSource = await format(
    `export const ${contractName}Abi = ${JSON.stringify(compiled.abi, null, 2)} as const;\n`,
    {
      parser: "typescript",
    },
  );
  await writeFile(join(abiDirectory, `${contractName}.ts`), abiSource);
}

console.log(`Compiled ${contractNames.length} contracts with solc ${solc.version()}`);
