export type ToastVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info";

export type ToastMode = "default" | "action";

export type ToastPosition =
  | "top-left"
  | "top"
  | "top-right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: ToastVariant;
};

export type ToastOptions = {
  variant?: ToastVariant;
  mode?: ToastMode;
  position?: ToastPosition;
  title?: string;
  message?: string;
  timeSec?: number | "inf";
  slide?: boolean;
  group?: string;
  stack?: boolean;
  /**
   * When true, renders an explicit dismiss action button (in addition to the X).
   * If `timeSec` is not provided, defaults to `"inf"`.
   */
  showDismissAction?: boolean;
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
  position: ToastPosition;
  title: string;
  message: string;
  timeSec: number | "inf";
  slide: boolean;
  showDismissAction: boolean;
  actions: ToastAction[];
};
