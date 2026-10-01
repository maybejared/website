import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins class names, dropping falsy values and resolving Tailwind conflicts. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
