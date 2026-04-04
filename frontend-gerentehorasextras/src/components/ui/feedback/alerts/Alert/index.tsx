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



type AlertProps = {
  title: string;
  message: string;
  okBtnText: string;
  time: boolean;
  timeSec: number;
  timeBar: boolean;
  onClose: () => void;
};

export function Alert({
  title,
  message,
  okBtnText,
  time,
  timeSec,
  timeBar,
  onClose,
}: AlertProps) {
  const { gColors } = useGlobalStyles();

  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(timeSec);
  const closedRef = useRef(false);

  const requestClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!time) return;

    setRemaining(timeSec);
    closedRef.current = false;

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRemaining(Math.max(0, timeSec - elapsed));
    }, 50);

    const timeoutId = window.setTimeout(() => {
      requestClose();
    }, timeSec);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [time, timeSec, requestClose]);

  if (!mounted) return null;

  return createPortal(
    <AlertsContainer>
      <View className={`${fStyles.alertsContainerAlert}`}>

        {title ? <Text size="h1" className="w-full text-center">
          {title}
        </Text> : null}

        {message ? <Text size="body" className="w-full text-left">
          {message}
        </Text> : null}

        <View className="w-full flex flex-row justify-center items-center bg-info p-4">
          <Button variant="main" color="primary" size="normal" onClick={requestClose}>
            {okBtnText}
          </Button>
          <Button variant="main" color="primary" size="normal" onClick={requestClose}>
            {okBtnText}
          </Button>
        </View>


        {time && timeBar ? (
          <Progress width={"full"} value={remaining} max={timeSec} barColor={gColors.success} wrapperColor="transparent" />
        ) : null}

      </View>
    </AlertsContainer>,
    document.body
  );
}