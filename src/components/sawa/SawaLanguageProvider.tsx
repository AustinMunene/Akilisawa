import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  readSawaLanguage,
  writeSawaLanguage,
  type SawaLanguage,
} from "../../lib/sawa/language";

type SawaLanguageContextValue = {
  readonly language: SawaLanguage;
  readonly setLanguage: (language: SawaLanguage) => void;
};

const FALLBACK: SawaLanguageContextValue = {
  language: "en",
  setLanguage: () => undefined,
};

// `null` means "no provider above": that is how a nested provider knows to
// defer, so the full-screen chat's header toggle and the age gate inside it
// share one language instead of drifting apart.
const SawaLanguageContext = createContext<SawaLanguageContextValue | null>(null);

export type SawaLanguageProviderProps = {
  readonly children: ReactNode;
  readonly initialLanguage?: SawaLanguage;
};

export function SawaLanguageProvider(props: SawaLanguageProviderProps) {
  const parent = useContext(SawaLanguageContext);
  if (parent) return props.children;
  return <OwnSawaLanguageProvider {...props} />;
}

function OwnSawaLanguageProvider({
  children,
  initialLanguage,
}: SawaLanguageProviderProps) {
  const [language, setLanguageState] = useState<SawaLanguage>(
    () => initialLanguage ?? readSawaLanguage()
  );

  const setLanguage = useCallback((next: SawaLanguage) => {
    setLanguageState(next);
    writeSawaLanguage(next);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage]
  );

  return (
    <SawaLanguageContext.Provider value={value}>
      {children}
    </SawaLanguageContext.Provider>
  );
}

export function useSawaLanguage(): SawaLanguageContextValue {
  return useContext(SawaLanguageContext) ?? FALLBACK;
}
