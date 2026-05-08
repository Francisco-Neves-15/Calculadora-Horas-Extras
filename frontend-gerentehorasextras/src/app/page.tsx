"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Style
import useGlobalStyles from "@/hooks/useGlobalStyles";

// Hooks
import { useI18n } from "@/hooks/useI18n";
import { useAlerts } from "@/hooks/useAlerts";
import { useToasts } from "@/hooks/useToasts";

// Components
import { Container } from "@/components/layout/Container";
import { View } from "@/components/ui/own/View";

export default function Home() {
  const tHome = useI18n("pag-home");

  const { gColors } = useGlobalStyles();

  return (
    <Container padding>
      <View>
        Test
        <Link href={"/layout_test/"}>Teste</Link>
        <Link href={"/settings/"}>Setting</Link>
      </View>
    </Container>
  );
}
