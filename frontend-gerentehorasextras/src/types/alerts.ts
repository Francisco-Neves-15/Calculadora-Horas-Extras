
// Alert
export type AlertOptions = {
  title?: string;
  message?: string;
  okBtnText?: string;
  onClose?: () => void;
  time?: boolean;
  timeSec?: number;
  timeBar?: boolean;
};

// Confirm
export type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

// Input
export type InputOptions = {
  title?: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
};

// Alert's
export type AlertsApi = {
  alert: (options: AlertOptions) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  input: (options: InputOptions) => Promise<string | null>;
  dismiss: () => void;
  clear: () => void;
};

export type InternalItem =
  | (InternalAlert & { type: "alert" })
  | (InternalConfirm & { type: "confirm" })
  | (InternalInput & { type: "input" });

// Alert
export type InternalAlert = Required<
  Pick<AlertOptions, "title" | "message" | "okBtnText" | "time" | "timeSec" | "timeBar">
> & {
  onClose?: () => void;
  id: string;
  resolve: () => void;
};

// Confirm
type InternalConfirm = Required<
  Pick<ConfirmOptions, "title" | "message" | "confirmText" | "cancelText">
> & {
  resolve: (value: boolean) => void;
  id: string;
};

// Input
type InternalInput = Required<
  Pick<InputOptions, "title" | "message" | "placeholder" | "confirmText" | "cancelText">
> & {
  resolve: (value: string | null) => void;
  id: string;
};
