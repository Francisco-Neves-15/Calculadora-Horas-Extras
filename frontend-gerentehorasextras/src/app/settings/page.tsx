import { useLang } from "@/contexts/useLangContext";
import { ISO_LANG_MAP } from "@/lang/main";

import { useStrings } from "@/hooks/useStrings";
import { THEME_MODE_META } from "@/configs/theme-mode.metadata";

export default function Settings() {
  const { lang, setLang } = useLang();
  const t = useStrings("common");

  return (
    <div>
      {Object.entries(ISO_LANG_MAP).map(([iso, code]) => (
        <button
          key={iso}
          onClick={() => setLang(code)}
          style={{ fontWeight: lang === code ? "bold" : "normal" }}
        >
          {code}
        </button>
      ))}
      {Object.values(THEME_MODE_META).map(opt => (
        <button key={opt.id}>{t[opt.id]}</button>
      ))}
    </div>
  );
}
