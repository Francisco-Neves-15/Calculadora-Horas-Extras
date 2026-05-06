"use client";
import Link from "next/link";

// forbidden, unauthorized

// Icons
import { LuTriangleAlert } from "react-icons/lu";

// Hooks
import { useI18n } from "@/hooks/useI18n";

// Components
import { Container } from "@/components/layout/Container";
import { View } from "@/components/ui/own/View";
import { Text } from "@/components/ui/own/Text";

export default function NotFound() {
  const tNotFound = useI18n("pag-notFound");

  return (
    <Container>
      <View className="w-full h-full flex-center overflow-hidden relative">
        <View className="absolute z-1">
          <LuTriangleAlert className="text-danger/15" size={256} />
        </View>
        <View className="flex-center z-2">
          <Text size="display">
            404
          </Text>
          <Text size="body">
            {tNotFound["page-not-found"]}
          </Text>
          <Text size="body" className="">
            <Link href={"/"}>{tNotFound["back-to-home"]}</Link>
          </Text>
        </View>
      </View>
    </Container>
  );
}