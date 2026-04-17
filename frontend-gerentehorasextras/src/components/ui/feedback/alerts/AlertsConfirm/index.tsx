"use client";

import { createPortal } from "react-dom";

// Styles
import fStyles from "../style.module.scss";

// Components
import Text from "@/components/ui/own/Text";
import View from "@/components/ui/own/View";
import Button from "@/components/ui/own/Button";

// Alerts
import AlertsContainer from "../AlertsContainer";

// Types
import { IAlertsConfirm } from "@/types/alerts";

// Utils
import useAlertsDefaultValues from "@/utils/values/alerts";

export function AlertsConfirm({
  title,
  message,
  confirmOptions,
  cancelOptions,
  onConfirm,
  onCancel,
}: IAlertsConfirm) {
  const { DEFAULT_CONFIRM_VALUES } = useAlertsDefaultValues();

  // Values
  const titleRes = title ?? DEFAULT_CONFIRM_VALUES.title;
  const messageRes = message ?? DEFAULT_CONFIRM_VALUES.message;
  const confirmOptionsRes = confirmOptions ?? DEFAULT_CONFIRM_VALUES.confirmOptions;
  const cancelOptionsRes = cancelOptions ?? DEFAULT_CONFIRM_VALUES.cancelOptions;
  const onConfirmRes = onConfirm ?? DEFAULT_CONFIRM_VALUES.onConfirm;
  const onCancelRes = onCancel ?? DEFAULT_CONFIRM_VALUES.onCancel;

  return createPortal(
    <AlertsContainer>
      <View className={fStyles.alertsContainerAlert}>
        {titleRes ? (
          <Text size="h1" className="w-full text-center">
            {titleRes}
          </Text>
        ) : null}

        {messageRes ? (
          <Text size="body" className="w-full text-left">
            {messageRes}
          </Text>
        ) : null}

        <View className={fStyles.alertsContainerAlertActions}>
          <Button
            variant={cancelOptionsRes?.variant}
            color={cancelOptionsRes?.color}
            onClick={onCancelRes}
            size="normal"
          >
            {cancelOptionsRes?.text}
          </Button>

          <Button
            variant={confirmOptionsRes?.variant}
            color={confirmOptionsRes?.color}
            onClick={onConfirmRes}
            size="normal"
          >
            {confirmOptionsRes?.text}
          </Button>
        </View>
      </View>
    </AlertsContainer>,
    document.body
  );
}
