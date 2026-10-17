import { toast } from "sonner";

export const notify = {
  success(message: string, description?: string): void {
    toast.success(message, { description });
  },
  error(message: string, description?: string): void {
    toast.error(message, { description });
  },
  info(message: string, description?: string): void {
    toast.info(message, { description });
  },
  warning(message: string, description?: string): void {
    toast.warning(message, { description });
  },
  promise<T>(
    promise: Promise<T>,
    data: { loading: string; success: string; error: string }
  ): void {
    toast.promise(promise, data);
  },
};
