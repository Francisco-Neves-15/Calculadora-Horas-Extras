import { useStrings } from "@/hooks/useStrings";

export default function Home() {
  const t = useStrings("home");

  return (
    <div className="">

      <main className="">
        <p className="color-white">não consigo ver nada</p>
      </main>
      
      <div>
        <h1>{t["home-title"]}</h1>
        <p>{t["home-welcome"]}</p>
        <button>{t["home-button-click"]}</button>
      </div>

    </div>
  );
}