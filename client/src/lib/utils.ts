import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Check if a given timestamp has expired based on a time duration
 * @param storedTime - timestamp in milliseconds (e.g. from Date.now())
 * @param duration - duration string like "1h", "30m", "2d"
 * @returns true if expired, false if still valid
 */
export function isExpired(storedTime: number, duration: string): boolean {
  const now = Date.now();
  const match = duration.match(/^(\d+)([hmd])$/);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}. Use formats like "1h", "30m", or "2d".`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let durationMs = 0;

  switch (unit) {
    case 'h':
      durationMs = value * 60 * 60 * 1000;
      break;
    case 'm':
      durationMs = value * 60 * 1000;
      break;
    case 'd':
      durationMs = value * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }

  return storedTime + durationMs < now;
}
