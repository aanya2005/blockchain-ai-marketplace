export type UploadErrorCode =
  | "UNAUTHORIZED"
  | "CONFIGURATION_ERROR"
  | "VALIDATION_ERROR"
  | "DUPLICATE_UPLOAD"
  | "ENCRYPTION_ERROR"
  | "STORAGE_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN";

export class UploadError extends Error {
  readonly code: UploadErrorCode;
  readonly status: number;

  constructor(code: UploadErrorCode, message: string, status = 400) {
    super(message);
    this.name = "UploadError";
    this.code = code;
    this.status = status;
  }
}

export function getUploadErrorPayload(error: unknown) {
  if (error instanceof UploadError) {
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
        code: "UNKNOWN" satisfies UploadErrorCode,
        message: "The dataset upload could not be completed. Please try again.",
      },
    },
  };
}
