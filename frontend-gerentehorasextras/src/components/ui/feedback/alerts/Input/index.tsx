"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "../style.module.scss";

// Components
import Text from "@/components/ui/own/Text";
import View from "@/components/ui/own/View";
import Button from "@/components/ui/own/Button";
import Input from "@/components/ui/own/Input";

// Alerts
import AlertsContainer from "../AlertsContainer";

// Types
import { IAlertsInput } from "@/types/alerts"



export function AlertsInput({
  title,
  message,
  placeholder,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: IAlertsInput) {
  const [value, setValue] = useState("");

  return createPortal(
    <AlertsContainer>
      <View className={fStyles.alertsContainerAlert}>

        {title ? <Text size="h1" className="w-full text-center">
          {title}
        </Text> : null}

        {message ? <Text size="body" className="w-full text-left">
          {message}
        </Text> : null}

        <View className="w-full justify-center items-start">
          <Input
            className="w-full"
            variant="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
        </View>

        <View className={fStyles.alertsContainerAlertActions}>

          <Button variant="secondary" size="normal" onClick={onCancel}>
            {cancelText}
          </Button>

          <Button variant="main" color="primary" size="normal" onClick={() => onConfirm(value)}>
            {confirmText}
          </Button>

        </View>

      </View>

    </AlertsContainer>,
    document.body
  );
}