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
import Container from "@/components/ui/own/Container";
import View from "@/components/ui/own/View";
import Input from "@/components/ui/own/Input";
import Button from "@/components/ui/own/Button";
import Text from "@/components/ui/own/Text";

// Icons
import { LuHouse } from "react-icons/lu";

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
