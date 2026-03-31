export type ToastVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info";

export type ToastMode = "default" | "action";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
  // variant?: ToastVariant;
};

export type ToastOptions = {
  variant?: ToastVariant;
  mode?: ToastMode;
  title?: string;
  message?: string;
  timeSec?: number | "inf";
  slide?: boolean;
  group?: string;
  stack?: boolean;
  actions?: ToastAction[];
};

export type ToastsApi = {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissGroup: (group: string) => void;
  clear: () => void;
};

export type InternalToast = {
  id: string;
  createdAt: number;
  updatedAt: number;
  group: string | null;
  stack: boolean;
  variant: ToastVariant;
  mode: ToastMode;
  title: string;
  message: string;
  timeSec: number | "inf";
  slide: boolean;
  actions: ToastAction[];
};

