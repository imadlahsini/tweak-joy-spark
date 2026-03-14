import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "ar" | "zgh" | "en" | "fr" | null;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("preferred-language") as Language) || null;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (lang) {
      localStorage.setItem("preferred-language", lang);
    } else {
      localStorage.removeItem("preferred-language");
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
