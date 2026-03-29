"use client";

import Link from "next/link";

import { useI18n } from "@/hooks/useI18n";
import { useAlerts } from "@/hooks/useAlerts";

export default function Home() {
  const tHome = useI18n("pag-home");
  // const { alert, confirm, input } = useAlerts();

  const testAlert = async () => {
    await global.alerts.alert({
      title: "Alerta!!!",
      msg: "Isso é um alerta",
      time: true,
      onClose: () => { console.log("Depois"); }
    });
  }

  const testConfirm = async () => {
    const res = await global.alerts.confirm({
      title: "Confirma?",
      msg: "Confirma isso?",
    });
    if (res) console.log("Aceito");
    else console.log("Recusado");
  }

  const testInput = async () => {
    const entry = await global.alerts.input({
      title: "Título",
      msg: "Mensagem",
    });
    console.log(entry)
  }

  return (
    <div className="">

      <main className="bg-primary">
        <p className="color-primary">não consigo ver nada</p>
      </main>
      
      <div>
        <h1>{tHome["home-title"]}</h1>
        <p>{tHome["home-welcome"]}</p>
        <button>{tHome["home-button-click"]}</button>
      </div>

      <div>
        <Link href={"settings"}>Config</Link>
      </div>

      <div>
        <button onClick={testAlert}>Teste Alert</button>
        <br />
        <button onClick={testConfirm}>Teste Confirm</button>
        <br />
        <button onClick={testInput}>Teste Input</button>
      </div>

    </div>
  );
}
