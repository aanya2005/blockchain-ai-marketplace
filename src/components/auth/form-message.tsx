import { Alert } from "@/components/ui/alert";

type FormMessageProps = {
  message: string | null;
  type: "error" | "success";
};

export function FormMessage({ message, type }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant={type === "error" ? "destructive" : "success"} aria-live="polite">
      {message}
    </Alert>
  );
}
