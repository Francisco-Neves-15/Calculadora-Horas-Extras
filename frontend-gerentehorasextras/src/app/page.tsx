"use client";

import Link from "next/link";

import { useI18n } from "@/hooks/useI18n";
import { useAlerts } from "@/hooks/useAlerts";
import { useToasts } from "@/hooks/useToasts";

import Button from "@/components/ui/own/Button"

export default function Home() {

  const tHome = useI18n("pag-home");

  const { alert, confirm, input } = useAlerts();
  const { toast } = useToasts();

  const testAlert = async () => {
    await alert({
      title: "Alerta!!!",
      message: "Isso é um alerta",
      time: true,
      onClose: () => { console.log("Depois"); }
    });
  }

  const testConfirm = async () => {
    const res = await confirm({
      title: "Confirma?",
      message: "Confirma isso?",
    });
    if (res) console.log("Aceito");
    else console.log("Recusado");
  }

  const testInput = async () => {
    const entry = await input({
      title: "Título",
      message: "Mensagem",
    });
    console.log(entry)
  }

  const testToast = async () => {
    await toast({
      mode: "action",
      variant: "danger",
      title: "Title",
      message: "Aprovado!",
      actions: [{ label: "Vai!", onClick: () => console.log("Click!") }],
      stack: false,
      slide: true,
      group: "teste112324", 
      timeSec: "inf",
      showDismissAction: true
    })
  }

  const testToast2 = async () => {
    await toast({
      mode: "default",
      variant: "default",
      title: "Title",
      message: "Aprovado!",
      actions: [{ label: "Vai!", onClick: () => console.log("Click!") }, ],
      stack: false,
      slide: true,
      group: "teste11232",
      timeSec: "inf"
    })
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
        <Button variant="bg-dark">Btn Teste</Button>
        <Button variant="bg-light">Btn Teste</Button>
        <Button variant="ghost" color="success" >Btn Teste</Button>
        <Button variant="invert" color="primary" >Btn Teste</Button>
        <Button variant="main" color="success" >Btn Teste</Button>
        <Button variant="main" color="theme" >Btn Teste</Button>
        <Button variant="outline" color="info" >Btn Teste</Button>
        <Button variant="outline" color="primary" >Btn Teste</Button>
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
        <br />
        <Button onClick={testToast}>Teste Toast</Button>
        <br />
        <Button onClick={testToast2}>Teste Toast</Button>
      </div>

    </div>
  );
}
