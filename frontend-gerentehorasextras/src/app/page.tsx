"use client";

import Link from "next/link";

// Style
import useGlobalStyles from "@/hooks/useGlobalStyles";

// Hooks
import { useI18n } from "@/hooks/useI18n";
import { useAlerts } from "@/hooks/useAlerts";
import { useToasts } from "@/hooks/useToasts";

// Components
import Button from "@/components/ui/own/Button"
import View from "@/components/ui/own/View";
import Text from "@/components/ui/own/Text";

// Icons
import { LuHouse } from "react-icons/lu"

export default function Home() {

  const tHome = useI18n("pag-home");

  const { gColors } = useGlobalStyles();

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

      <div className="flex flex-row justify-start align-center">
        <Button variant="secondary">Btn Secondary</Button>
        <Button variant="bg-dark">Btn bg-dark</Button>
        <Button variant="bg-light">Btn bg-light</Button>
      </div>

      <div className="flex flex-row justify-start items-center">
        <Button variant="main" color="primary">Btn primary</Button>
        <Button variant="main" color="info">Btn info</Button>
        <Button variant="main" color="warning">Btn warning</Button>
        <Button variant="main" color="danger">Btn danger</Button>
        <Button variant="main" color="success">Btn success</Button>
        <Button variant="main" color="neutral">Btn neutral</Button>
        <Button variant="main" color="theme">Btn theme</Button>
        <Button variant="main" color="theme"><LuHouse size={24} /></Button>
        <Button variant="main" color="theme" iconRound><LuHouse size={24} /></Button>
      </div>

      <div className="flex flex-row justify-start items-center">
        <Button variant="outline" color="primary">Btn primary</Button>
        <Button variant="outline" color="info">Btn info</Button>
        <Button variant="outline" color="warning">Btn warning</Button>
        <Button variant="outline" color="danger">Btn danger</Button>
        <Button variant="outline" color="success">Btn success</Button>
        <Button variant="outline" color="neutral">Btn neutral</Button>
        <Button variant="outline" color="theme">Btn theme</Button>
        <Button variant="outline" color="theme"><LuHouse size={24} /></Button>
        <Button variant="outline" color="theme" iconRound><LuHouse size={24} /></Button>
      </div>

      <div className="flex flex-row justify-start items-center">
        <Button variant="ghost" color="primary">Btn primary</Button>
        <Button variant="ghost" color="info">Btn info</Button>
        <Button variant="ghost" color="warning">Btn warning</Button>
        <Button variant="ghost" color="danger">Btn danger</Button>
        <Button variant="ghost" color="success">Btn success</Button>
        <Button variant="ghost" color="neutral">Btn neutral</Button>
        <Button variant="ghost" color="theme">Btn theme</Button>
        <Button variant="ghost" color="theme"><LuHouse size={24} /></Button>
        <Button variant="ghost" color="theme" iconRound><LuHouse size={24} /></Button>
      </div>

      <div className="flex flex-row justify-start align-center">
        <Button>Texto</Button>
        <Button><p>Texto</p></Button>
        <Button><span>Texto</span></Button>

        <Button>
          <p>Texto 1</p>
          <span>Texto 2</span>
        </Button>

        <Button>
          <LuHouse size={24} />
          <p>Texto 0</p>
        </Button>

        <Button size="normal" >Btn normal</Button>
        <Button size="normal" disabled >Btn normal</Button>
        <Button size="normal" interaction={false} >Btn normal</Button>
      </div>

      <div>
        <Link href={"settings"}>Config</Link>
      </div>

      <div className="">
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

      <View>
        <Text size="display">Text display</Text>
        <Text size="h1">Text h1</Text>
        <Text size="h2">Text h2</Text>
        <Text size="h3">Text h3</Text>
        <Text size="body">Text body</Text>
        <Text size="caption">Text caption</Text>
        <Text size="micro">Text micro</Text>
        <Text size="nano">Text nano</Text>
      </View>

      <View>
        <Text size="body" color={gColors.danger}>Text danger</Text>
        <Text size="body" color={gColors.success}>Text success</Text>
        <Text size="body" color={gColors.success} span>Text success span</Text>
      </View>

      <View>
        <Text size="body" className="text-2xl">Text 2xl</Text>
        <Text size="body" className="w-full bg-danger text-right">Text</Text>
      </View>



    </div>
  );
}
