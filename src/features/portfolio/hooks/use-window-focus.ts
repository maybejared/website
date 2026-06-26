"use client";
import { createContext, useContext } from "react";

export const WindowFocusContext = createContext(false);

export const useWindowFocus = (): boolean => useContext(WindowFocusContext);
