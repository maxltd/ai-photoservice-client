"use client";

import { createContext, useContext } from "react";

interface MainPageContextValue {
  goToSection: (index: number) => void;
  closeBanner: () => void;
  openLogin: () => void;
}

const MainPageContext = createContext<MainPageContextValue | null>(null);

export function MainPageContextProvider({
  value,
  children,
}: {
  value: MainPageContextValue;
  children: React.ReactNode;
}): React.JSX.Element {
  return <MainPageContext.Provider value={value}>{children}</MainPageContext.Provider>;
}

export function useOptionalMainPageContext(): MainPageContextValue | null {
  return useContext(MainPageContext);
}

export function useMainPageContext(): MainPageContextValue {
  const context = useOptionalMainPageContext();
  if (!context) {
    throw new Error("useMainPageContext must be used within MainPageContextProvider");
  }
  return context;
}
