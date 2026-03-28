"use client";

import Link from "next/link";

import { useStrings } from "@/hooks/useStrings";

export default function Home() {
  const tHome = useStrings("pag-home");

  return (
    <div className="">

      <main className="">
        <p className="color-white">não consigo ver nada</p>
      </main>
      
      <div>
        <h1>{tHome["home-title"]}</h1>
        <p>{tHome["home-welcome"]}</p>
        <button>{tHome["home-button-click"]}</button>
      </div>

      <Link href={"settings"}>Config</Link>

    </div>
  );
}
