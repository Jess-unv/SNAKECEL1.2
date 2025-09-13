// src/context/ThemeContext.tsx
import React, { Dispatch, SetStateAction } from "react";

export type ThemeType = "light" | "dark";

export const ThemeContext = React.createContext<{
  theme: ThemeType;
  setTheme: Dispatch<SetStateAction<ThemeType>>;
}>({
  theme: "light",
  setTheme: () => {},
});
