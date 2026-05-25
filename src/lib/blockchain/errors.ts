export type BlockchainErrorCode =
  | "CONFIGURATION_ERROR"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "WALLET_VERIFICATION_FAILED"
  | "TRANSACTION_VERIFICATION_FAILED"
  | "DUPLICATE_TRANSACTION"
  | "DATABASE_ERROR"
  | "UNKNOWN";

export class BlockchainError extends Error {
  readonly code: BlockchainErrorCode;
  readonly status: number;

  constructor(code: BlockchainErrorCode, message: string, status = 400) {
    super(message);
    this.name = "BlockchainError";
    this.code = code;
    this.status = status;
  }
}

export function getBlockchainErrorPayload(error: unknown) {
  if (error instanceof BlockchainError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "UNKNOWN" satisfies BlockchainErrorCode,
        message: "The blockchain request could not be completed.",
      },
    },
  };
}
