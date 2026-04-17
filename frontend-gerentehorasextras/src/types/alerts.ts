import { TButtonColors, TButtonVariants } from "@/components/ui/own/Button";
import { IInputVariantConfigs, TInputVariant } from "@/components/ui/own/Input";

// Alert
export type IAlertsAlert = {
  title?: string;
  message?: string;
  btnOptions?: {
    text?: string;
    variant?: TButtonVariants;
    color?: TButtonColors;
  };
  timeOptions?: {
    time?: boolean;
    timeSec?: number;
    timeBar?: boolean;
  };
  onClose?: () => void;
};

// Confirm
export interface IAlertsConfirm {
  title?: string;
  message?: string;
  confirmOptions?: {
    text?: string;
    variant?: TButtonVariants;
    color?: TButtonColors;
  };
  cancelOptions?: {
    text?: string;
    variant?: TButtonVariants;
    color?: TButtonColors;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Input
export interface IAlertsInput {
  title?: string;
  message?: string;
  placeholder?: string;
  inputVariant?: TInputVariant;
  inputVariantsConfigs?: IInputVariantConfigs;
  confirmOptions?: {
    text?: string;
    variant?: TButtonVariants;
    color?: TButtonColors;
  };
  cancelOptions?: {
    text?: string;
    variant?: TButtonVariants;
    color?: TButtonColors;
  };
  onConfirm?: (value: string | null) => void;
  onCancel?: () => void;
  required?: boolean;
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
}

// Confirm
export interface InternalConfirm extends IAlertsConfirm {
  id: string;
  resolve: (value: boolean) => void;
}

// Input
export interface InternalInput extends IAlertsInput {
  id: string;
  resolve: (value: string | null) => void;
}
