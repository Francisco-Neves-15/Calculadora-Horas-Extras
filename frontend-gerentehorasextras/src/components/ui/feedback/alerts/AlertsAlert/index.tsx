"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Style
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "../style.module.scss";

// Components
import Text from "@/components/ui/own/Text";
import View from "@/components/ui/own/View";
import Button from "@/components/ui/own/Button";
import Progress from "@/components/ui/own/Progress";

// Alerts
import AlertsContainer from "../AlertsContainer";

// Types
import { IAlertsAlert } from "@/types/alerts";

// Utils
import useAlertsDefaultValues from "@/utils/values/alerts";

export function AlertsAlert({ title, message, btnOptions, timeOptions, onClose }: IAlertsAlert) {
  const { gColors } = useGlobalStyles();

  const { DEFAULT_ALERT_VALUES } = useAlertsDefaultValues();

  // Values
  const titleRes = title ?? DEFAULT_ALERT_VALUES.title;
  const messageRes = message ?? DEFAULT_ALERT_VALUES.message;
  const btnOptionsRes = btnOptions ?? DEFAULT_ALERT_VALUES.btnOptions;
  const timeOptionsRes = timeOptions ?? DEFAULT_ALERT_VALUES.timeOptions;
  const onCloseRes = onClose ?? DEFAULT_ALERT_VALUES.onClose;

  //
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(timeOptionsRes?.timeSec);
  const closedRef = useRef(false);

  const requestClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (onCloseRes) onCloseRes();
  }, [onCloseRes]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!timeOptionsRes?.time) return;

    setRemaining(timeOptionsRes?.timeSec);
    closedRef.current = false;

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const time = timeOptionsRes?.timeSec ?? 3000;
      setRemaining(Math.max(0, time - elapsed));
    }, 50);

    const timeoutId = window.setTimeout(() => {
      requestClose();
    }, timeOptionsRes?.timeSec);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [timeOptionsRes?.time, timeOptionsRes?.timeSec, requestClose]);

  if (!mounted) return null;

  return createPortal(
    <AlertsContainer>
      <View
        className={`${fStyles.alertsContainerAlert} ${timeOptionsRes?.time && timeOptionsRes?.timeBar ? fStyles.alertsContainerAlertTimed : ""}`}
      >
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
            variant={btnOptionsRes?.variant}
            color={btnOptionsRes?.color}
            size="normal"
            onClick={requestClose}
          >
            {btnOptionsRes?.text}
          </Button>
        </View>
      </View>

      {timeOptionsRes?.time && timeOptionsRes?.timeBar ? (
        <div className={fStyles.areaTimeBar}>
          <Progress
            width={"full"}
            value={remaining}
            max={timeOptionsRes?.timeSec}
            barColor={gColors.success}
            wrapperColor="transparent"
          />
        </div>
      ) : null}
    </AlertsContainer>,
    document.body
  );
}
