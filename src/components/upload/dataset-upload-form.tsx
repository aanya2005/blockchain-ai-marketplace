"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  FileText,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { FormMessage } from "@/components/auth/form-message";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDatasetUpload } from "@/hooks/use-dataset-upload";
import { uploadCategories } from "@/lib/upload/constants";
import {
  assertSupportedFileMetadata,
  formatBytes,
} from "@/lib/upload/metadata-validation";
import {
  datasetUploadFormSchema,
  type DatasetUploadFormValues,
} from "@/lib/upload/schema";
import { cn } from "@/lib/utils";

const defaultValues: DatasetUploadFormValues = {
  title: "",
  description: "",
  category: "Research",
  tags: "",
  publishState: "draft",
};

export function DatasetUploadForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { error, isUploading, progress, result, status, upload, reset } =
    useDatasetUpload();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<DatasetUploadFormValues>({
    resolver: zodResolver(datasetUploadFormSchema),
    defaultValues,
  });

  const publishState = watch("publishState");
  const isBusy = isUploading || isSubmitting;

  function validateAndSetFile(file: File | null) {
    setFileError(null);
    reset();

    if (!file) {
      setSelectedFile(null);
      return;
    }

    try {
      assertSupportedFileMetadata(file);
      setSelectedFile(file);
    } catch (validationError) {
      const message =
        validationError instanceof Error
          ? validationError.message
          : "Choose a supported dataset file.";
      setSelectedFile(null);
      setFileError(message);
    }
  }

  async function onSubmit(values: DatasetUploadFormValues) {
    if (!selectedFile) {
      setFileError("Choose a dataset file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("category", values.category);
    formData.set("tags", values.tags);
    formData.set("publishState", values.publishState);
    formData.set("file", selectedFile);

    try {
      await upload(formData);
    } catch {
      // The hook owns the user-facing error state.
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dataset details</CardTitle>
          <CardDescription>
            Metadata is validated before upload, encrypted server-side, pinned to IPFS,
            and saved to Supabase with CID metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormMessage message={error} type="error" />
            <FormMessage
              message={
                status === "success"
                  ? "Dataset encrypted, pinned to IPFS, and saved successfully."
                  : null
              }
              type="success"
            />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Urban traffic sensor observations"
                disabled={isBusy}
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe provenance, schema, privacy handling, and intended AI use cases."
                disabled={isBusy}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  disabled={isBusy}
                  className="h-11 w-full rounded-2xl border border-input bg-background/70 px-4 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("category")}
                >
                  {uploadCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.category?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="csv, mobility, sensors"
                  disabled={isBusy}
                  aria-invalid={Boolean(errors.tags)}
                  {...register("tags")}
                />
                <FieldError message={errors.tags?.message} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Visibility state</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    "rounded-2xl border p-4 text-sm transition-colors",
                    publishState === "draft"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30",
                  )}
                >
                  <input
                    type="radio"
                    value="draft"
                    className="mr-2"
                    disabled={isBusy}
                    {...register("publishState")}
                  />
                  Save as draft
                </label>
                <label
                  className={cn(
                    "rounded-2xl border p-4 text-sm transition-colors",
                    publishState === "published"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30",
                  )}
                >
                  <input
                    type="radio"
                    value="published"
                    className="mr-2"
                    disabled={isBusy}
                    {...register("publishState")}
                  />
                  Submit for review
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset-file">Dataset file</Label>
              <div
                className={cn(
                  "rounded-3xl border border-dashed p-6 text-center transition-colors",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/20",
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  validateAndSetFile(event.dataTransfer.files.item(0));
                }}
              >
                <input
                  ref={fileInputRef}
                  id="dataset-file"
                  type="file"
                  className="sr-only"
                  accept=".csv,.json,.jsonl,.txt,.zip,text/csv,application/json,text/plain,application/zip"
                  disabled={isBusy}
                  onChange={(event) => {
                    validateAndSetFile(event.target.files?.item(0) ?? null);
                  }}
                />
                <UploadCloud
                  className="mx-auto size-10 text-primary"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold">Drag and drop a dataset file</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  CSV, JSON, JSONL, TXT, or ZIP up to 50 MB.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
              </div>
              <FieldError message={fileError ?? undefined} />
              {selectedFile ? (
                <Alert>
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-foreground">{selectedFile.name}</p>
                      <p>{formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                </Alert>
              ) : null}
            </div>

            {isUploading ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading and validating</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={isBusy} className="flex-1">
                {isUploading ? "Uploading..." : "Upload dataset"}
              </Button>
              {status === "error" ? (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isBusy}
                  className="flex-1"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Retry upload
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Secure processing</CardTitle>
            <CardDescription>
              Uploads are encrypted before Pinata/IPFS storage. Blockchain registration
              remains deferred.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {[
              "Authenticated upload endpoint",
              "Server-side file validation",
              "Path traversal resistant filenames",
              "Duplicate checksum detection",
              "Draft or review-ready dataset states",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {result ? (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                Upload preview
              </CardTitle>
              <CardDescription>
                Metadata was persisted and a safe preview was generated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="font-semibold">{result.dataset.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {result.dataset.file_name} ·{" "}
                  {formatBytes(result.dataset.file_size_bytes)}
                </p>
              </div>
              <pre className="max-h-72 overflow-auto rounded-2xl border border-border bg-background/80 p-4 text-xs leading-5 text-muted-foreground">
                {result.preview.text}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Preview will appear here</CardTitle>
              <CardDescription>
                After a successful upload, the generated dataset preview and saved
                metadata summary will be displayed.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
