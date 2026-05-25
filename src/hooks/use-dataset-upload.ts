"use client";

import { useCallback, useRef, useState } from "react";

import type { DatasetUploadResponse, UploadFailureResponse } from "@/lib/upload/types";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadDatasetState = {
  status: UploadStatus;
  progress: number;
  error: string | null;
  result: DatasetUploadResponse | null;
};

const initialState: UploadDatasetState = {
  status: "idle",
  progress: 0,
  error: null,
  result: null,
};

export function useDatasetUpload() {
  const [state, setState] = useState<UploadDatasetState>(initialState);
  const activeRequestRef = useRef<XMLHttpRequest | null>(null);

  const reset = useCallback(() => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setState(initialState);
  }, []);

  const upload = useCallback((formData: FormData) => {
    activeRequestRef.current?.abort();

    setState({
      status: "uploading",
      progress: 0,
      error: null,
      result: null,
    });

    return new Promise<DatasetUploadResponse>((resolve, reject) => {
      const request = new XMLHttpRequest();
      activeRequestRef.current = request;

      request.open("POST", "/api/uploads/datasets");
      request.responseType = "text";

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const progress = Math.min(95, Math.round((event.loaded / event.total) * 95));
        setState((current) => ({ ...current, progress }));
      };

      request.onload = () => {
        const parsed = parseUploadResponse(request.responseText);

        if (request.status >= 200 && request.status < 300 && "dataset" in parsed) {
          setState({
            status: "success",
            progress: 100,
            error: null,
            result: parsed,
          });
          resolve(parsed);
          return;
        }

        const message =
          "error" in parsed
            ? parsed.error.message
            : "The upload failed. Please review the file and retry.";
        setState({
          status: "error",
          progress: 0,
          error: message,
          result: null,
        });
        reject(new Error(message));
      };

      request.onerror = () => {
        const message = "Network error while uploading. Check your connection and retry.";
        setState({
          status: "error",
          progress: 0,
          error: message,
          result: null,
        });
        reject(new Error(message));
      };

      request.onabort = () => {
        const message = "Upload cancelled.";
        setState({
          status: "error",
          progress: 0,
          error: message,
          result: null,
        });
        reject(new Error(message));
      };

      request.send(formData);
    });
  }, []);

  return {
    ...state,
    isUploading: state.status === "uploading",
    upload,
    reset,
  };
}

function parseUploadResponse(
  responseText: string,
): DatasetUploadResponse | UploadFailureResponse {
  try {
    return JSON.parse(responseText) as DatasetUploadResponse | UploadFailureResponse;
  } catch {
    return {
      error: {
        code: "INVALID_RESPONSE",
        message: "The upload service returned an invalid response.",
      },
    };
  }
}
