"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

// Styles
import fStyles from "../style.module.scss";

// Components
import { Text } from "@/components/ui/own/Text";
import { View } from "@/components/ui/own/View";
import { Button } from "@/components/ui/own/Button";
import { Input } from "@/components/ui/own/Input";

// Alerts
import AlertsContainer from "../AlertsContainer";

// Types
import { IAlertsInput } from "@/types/alerts";

// Utils
import useAlertsDefaultValues from "@/utils/values/alerts";

export function AlertsInput({
  title,
  message,
  placeholder,
  inputVariant,
  inputVariantsConfigs,
  confirmOptions,
  cancelOptions,
  onConfirm,
  onCancel,
  required,
}: IAlertsInput) {
  const [value, setValue] = useState("");

  const { DEFAULT_INPUT_VALUES } = useAlertsDefaultValues();

  // Values
  const titleRes = title ?? DEFAULT_INPUT_VALUES.title;
  const messageRes = message ?? DEFAULT_INPUT_VALUES.message;
  const confirmOptionsRes = { ...DEFAULT_INPUT_VALUES.confirmOptions, ...confirmOptions };
  const cancelOptionsRes = { ...DEFAULT_INPUT_VALUES.cancelOptions, ...cancelOptions };
  const requiredRes = required ?? DEFAULT_INPUT_VALUES.required;

  const isValid = useMemo(() => {
    if (requiredRes) {
      if (value.length <= 0) return false;
      else return true;
    } else return true;
  }, [value, requiredRes]);

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

        <View className="w-full flex-col justify-center items-start">
          <Input
            containerClassName="w-full"
            className=""
            variant={inputVariant}
            variantsConfigs={inputVariantsConfigs}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            data-alert-autofocus="true"
          />
        </View>

        <View className={fStyles.alertsContainerAlertActions}>
          <Button
            variant={cancelOptionsRes?.variant}
            color={cancelOptionsRes?.color}
            onClick={onCancel}
            size="normal"
          >
            {cancelOptionsRes?.text}
          </Button>

          <Button
            variant={confirmOptionsRes?.variant}
            color={confirmOptionsRes?.color}
            size="normal"
            onClick={() => {
              if (isValid) onConfirm?.(value);
            }}
            disabled={!isValid}
          >
            {confirmOptionsRes?.text}
          </Button>
        </View>
      </View>
    </AlertsContainer>,
    document.body
  );
}
