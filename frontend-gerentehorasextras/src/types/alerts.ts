import { TButtonColors, TButtonVariants } from "@/components/ui/own/Button";

// Alert
export type IAlertsAlert = {
  title?: string;
  message?: string;
  btnOptions?: {
    btnText: string;
    btnVariant: TButtonVariants;
    btnColor: TButtonColors;
  };
  timeOptions?: {
    time: boolean;
    timeSec: number;
    timeBar: boolean;
  };
  onClose?: () => void;
};

// Confirm
export interface IAlertsConfirm {
  title: string;
  message: string;
  confirmTextOptions: {
    confirmText: string;
    confirmTextVariant: TButtonVariants;
    confirmTextColor: TButtonColors;
  };
  cancelTextOptions: {
    cancelText: string;
    cancelTextVariant: TButtonVariants;
    cancelTextColor: TButtonColors;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

// Input
export interface IAlertsInput {
  title: string;
  message: string;
  placeholder: string;
  confirmTextOptions: {
    confirmText: string;
    confirmTextVariant: TButtonVariants;
    confirmTextColor: TButtonColors;
  };
  cancelTextOptions: {
    cancelText: string;
    cancelTextVariant: TButtonVariants;
    cancelTextColor: TButtonColors;
  };
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

// ===== Internal

export type InternalItem =
  | (InternalAlert & { type: "alert" })
  | (InternalConfirm & { type: "confirm" })
  | (InternalInput & { type: "input" });

// Alert
export interface InternalAlert extends IAlertsAlert {
  id: string;
  resolve: () => void;
};

// Confirm
type InternalConfirm = Required<
  Pick<IAlertsConfirm, "title" | "message" | "confirmTextOptions" | "cancelTextOptions">
> & {
  resolve: (value: boolean) => void;
  id: string;
};

// Input
type InternalInput = Required<
  Pick<IAlertsInput, "title" | "message" | "placeholder" | "confirmTextOptions" | "cancelTextOptions">
> & {
  resolve: (value: string | null) => void;
  id: string;
};
