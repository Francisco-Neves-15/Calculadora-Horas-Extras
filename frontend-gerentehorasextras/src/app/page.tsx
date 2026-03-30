"use client";

import Link from "next/link";

import { useI18n } from "@/hooks/useI18n";
// import { useAlerts } from "@/hooks/useAlerts";

import Button from "@/components/ui/own/Button"

export default function Home() {
  const tHome = useI18n("pag-home");
  // const { alert, confirm, input } = useAlerts();

  const testAlert = async () => {
    await global.alerts.alert({
      title: "Alerta!!!",
      message: "Isso é um alerta",
      time: true,
      onClose: () => { console.log("Depois"); }
    });
  }

  const testConfirm = async () => {
    const res = await global.alerts.confirm({
      title: "Confirma?",
      message: "Confirma isso?",
    });
    if (res) console.log("Aceito");
    else console.log("Recusado");
  }

  const testInput = async () => {
    const entry = await global.alerts.input({
      title: "Título",
      message: "Mensagem",
    });
    console.log(entry)
  }

  return (
    <div className="">

      <main className="bg-primary">
        <p className="text-primaryContrast">Teste Tailwind: fundo primary + texto contrast</p>
      </main>
      
      <div>
        <h1>{tHome["home-title"]}</h1>
        <p>{tHome["home-welcome"]}</p>
        <Button>{tHome["home-button-click"]}</Button>
      </div>

      <div>
        <Link href={"settings"}>Config</Link>
      </div>

      <div>
        <Button onClick={testAlert}>Teste Alert</Button>
        <br />
        <Button onClick={testConfirm}>Teste Confirm</Button>
        <br />
        <Button onClick={testInput}>Teste Input</Button>
      </div>

    </div>
  );
}
