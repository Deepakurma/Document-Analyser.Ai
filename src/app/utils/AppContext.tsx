"use client";

import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

type context = {
  fileName: string;
  setFileName: Dispatch<SetStateAction<string>>;
};

const AppContext = createContext<context | null>(null);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [fileName, setFileName] = useState<string>("");

  return (
    <AppContext.Provider value={{ fileName, setFileName }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
};
