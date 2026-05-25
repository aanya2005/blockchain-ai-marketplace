import { assertValidCid, createPinataGatewayUrl } from "@/lib/ipfs/cid";
import { UploadError } from "@/lib/upload/errors";

const pinataApiBaseUrl = "https://api.pinata.cloud";
const defaultTimeoutMs = 30_000;
const defaultMaxAttempts = 3;

export type PinataPinnedFile = {
  cid: string;
  sizeBytes: number;
  timestamp: string;
  isDuplicate: boolean;
  gatewayUrl: string;
  pinataResponse: Record<string, unknown>;
};

type PinFileInput = {
  buffer: Buffer;
  filename: string;
  contentType: string;
  metadata: Record<string, string>;
};

type PinataClientOptions = {
  jwt?: string;
  gatewayBaseUrl?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  fetchImplementation?: typeof fetch;
};

export class PinataClient {
  private readonly jwt: string;
  private readonly gatewayBaseUrl?: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: PinataClientOptions = {}) {
    const jwt = options.jwt ?? process.env.PINATA_JWT?.trim();

    if (!jwt) {
      throw new UploadError(
        "CONFIGURATION_ERROR",
        "PINATA_JWT must be configured server-side before IPFS uploads.",
        503,
      );
    }

    this.jwt = jwt;
    this.gatewayBaseUrl =
      options.gatewayBaseUrl ?? process.env.PINATA_GATEWAY_URL?.trim();
    this.timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
    this.maxAttempts = options.maxAttempts ?? defaultMaxAttempts;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async pinEncryptedFile(input: PinFileInput): Promise<PinataPinnedFile> {
    return this.withRetry(async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([new Uint8Array(input.buffer)], { type: input.contentType }),
        input.filename,
      );
      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: input.filename,
          keyvalues: input.metadata,
        }),
      );
      formData.append(
        "pinataOptions",
        JSON.stringify({
          cidVersion: 1,
        }),
      );

      const response = await this.requestWithTimeout(
        `${pinataApiBaseUrl}/pinning/pinFileToIPFS`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.jwt}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new UploadError(
          "STORAGE_ERROR",
          `Pinata upload failed with status ${response.status}.`,
          response.status >= 500 ? 502 : 400,
        );
      }

      const body = (await response.json()) as {
        IpfsHash?: string;
        PinSize?: number;
        Timestamp?: string;
        isDuplicate?: boolean;
      };
      const cid = assertValidCid(body.IpfsHash ?? "");

      return {
        cid,
        sizeBytes: body.PinSize ?? input.buffer.byteLength,
        timestamp: body.Timestamp ?? new Date().toISOString(),
        isDuplicate: Boolean(body.isDuplicate),
        gatewayUrl: createPinataGatewayUrl(cid, this.gatewayBaseUrl),
        pinataResponse: body,
      };
    });
  }

  async unpin(cid: string): Promise<void> {
    const validCid = assertValidCid(cid);
    const response = await this.requestWithTimeout(
      `${pinataApiBaseUrl}/pinning/unpin/${validCid}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.jwt}`,
        },
      },
    );

    if (!response.ok && response.status !== 404) {
      throw new UploadError(
        "STORAGE_ERROR",
        `Pinata rollback failed with status ${response.status}.`,
        502,
      );
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxAttempts || !isRetryableUploadError(error)) {
          break;
        }

        await wait(200 * 2 ** (attempt - 1));
      }
    }

    if (lastError instanceof UploadError) {
      throw lastError;
    }

    throw new UploadError(
      "STORAGE_ERROR",
      "Pinata upload failed after retry attempts.",
      502,
    );
  }

  private async requestWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchImplementation(url, {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new UploadError("STORAGE_ERROR", "Pinata request timed out.", 504);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createPinataClient() {
  return new PinataClient();
}

function isRetryableUploadError(error: unknown) {
  if (!(error instanceof UploadError)) {
    return true;
  }

  return error.status === 502 || error.status === 503 || error.status === 504;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
