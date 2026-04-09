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
import { IAlertsConfirm } from "@/types/alerts"



export function AlertsConfirm({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: IAlertsConfirm) {

  return createPortal(
    <AlertsContainer>
      <View className={fStyles.alertsContainerAlert}>

        {title ? <Text size="h1" className="w-full text-center">
          {title}
        </Text> : null}

        {message ? <Text size="body" className="w-full text-left">
          {message}
        </Text> : null}

        <View className={fStyles.alertsContainerAlertActions}>

          <Button variant="secondary" size="normal" onClick={onCancel}>
            {cancelText}
          </Button>

          <Button variant="main" color="primary" size="normal" onClick={onConfirm}>
            {confirmText}
          </Button>

        </View>

      </View>

    </AlertsContainer>,
    document.body
  );
}