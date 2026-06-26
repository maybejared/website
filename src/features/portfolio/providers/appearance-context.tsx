"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { SchemeName } from "@/src/shared/types/portfolio";

/** The slice of appearance state that context-free apps (e.g. imv) need to read. */
export interface AppearanceValue {
  scheme: SchemeName;
  wallpaperId: string;
}

const AppearanceContext = createContext<AppearanceValue | null>(null);

interface Props {
  value: AppearanceValue;
  children: ReactNode;
}

/**
 * Carries the live appearance selection down to apps whose `render` is
 * context-free (the app registry can't pass props). The `imv` decor app reads
 * this to mirror the currently selected wallpaper.
 */
export const AppearanceProvider: FC<Props> = ({ value, children }) => (
  <AppearanceContext.Provider value={value}>
    {children}
  </AppearanceContext.Provider>
);

export const useAppearanceContext = (): AppearanceValue | null =>
  useContext(AppearanceContext);
