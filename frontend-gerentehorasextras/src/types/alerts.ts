
// Alert
export interface IAlertsAlert {
  title: string;
  message: string;
  okBtnText: string;
  time: boolean;
  timeSec: number;
  timeBar: boolean;
  onClose: () => void;
};

// Confirm
export interface IAlertsConfirm {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Input
export interface IAlertsInput {
  title: string;
  message: string;
  placeholder: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

// Alert's
export type AlertsApi = {
  alert: (options: IAlertsAlert) => Promise<void>;
  confirm: (options: IAlertsConfirm) => Promise<boolean>;
  input: (options: IAlertsInput) => Promise<string | null>;
  dismiss: () => void;
  clear: () => void;
};

export type InternalItem =
  | (InternalAlert & { type: "alert" })
  | (InternalConfirm & { type: "confirm" })
  | (InternalInput & { type: "input" });

// Alert
export type InternalAlert = Required<
  Pick<IAlertsAlert, "title" | "message" | "okBtnText" | "time" | "timeSec" | "timeBar">
> & {
  onClose?: () => void;
  id: string;
  resolve: () => void;
};

// Confirm
type InternalConfirm = Required<
  Pick<IAlertsConfirm, "title" | "message" | "confirmText" | "cancelText">
> & {
  resolve: (value: boolean) => void;
  id: string;
};

// Input
type InternalInput = Required<
  Pick<IAlertsInput, "title" | "message" | "placeholder" | "confirmText" | "cancelText">
> & {
  resolve: (value: string | null) => void;
  id: string;
};
