"use client";
import { useMemo } from "react";

// Hooks
import { useI18n } from "@/hooks/useI18n";

// Types
import { IAlertsAlert, IAlertsConfirm, IAlertsInput } from "@/types/alerts";

const useAlertsDefaultValues = () => {
  const tCommon = useI18n("common");
  
  const DEFAULT_ALERT_VALUES: IAlertsAlert = useMemo(() => ({
    title: "title",
    message: "message",
    btnOptions: {
      text: tCommon["common-ok"],
      variant: "main",
      color: "primary",
    },
    timeOptions: {
      time: true,
      timeSec: 3000,
      timeBar: true,
    },
    onClose: () => {},
  }), [tCommon]);
  
  const DEFAULT_CONFIRM_VALUES: IAlertsConfirm = useMemo(() => ({
    title: "title",
    message: "message",
    confirmOptions: {
      text: tCommon["common-confirm"],
      variant: "main",
      color: "primary",
    },
    cancelOptions: {
      text: tCommon["common-cancel"],
      variant: "secondary",
      color: "theme",
    },
    onConfirm: () => {},
    onCancel: () => {},
  }), [tCommon]);
  
  const DEFAULT_INPUT_VALUES: IAlertsInput = useMemo(() => ({
    title: "title",
    message: "message",
    placeholder: tCommon["common-typeHere"],
    confirmOptions: {
      text: tCommon["common-confirm"],
      variant: "main",
      color: "primary",
    },
    cancelOptions: {
      text: tCommon["common-cancel"],
      variant: "secondary",
      color: "theme",
    },
    onConfirm: () => {},
    onCancel: () => {},
    required: true,
  }), [tCommon]);

  return {
    DEFAULT_ALERT_VALUES,
    DEFAULT_CONFIRM_VALUES,
    DEFAULT_INPUT_VALUES
  }

}

export default useAlertsDefaultValues;
