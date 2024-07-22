import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export interface Hand {
  played_at: string,
  hand_id: number,
  amount: number
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
