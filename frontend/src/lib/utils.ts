import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------- Profile Management (for persistent login) ----------
export interface Profile {
  username: string;
  sessionId: string;
}

const PROFILES_STORAGE_KEY = 'chat_profiles';

export function getProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse profiles:', e);
  }
  return [];
}

export function addProfile(profile: Profile): void {
  const profiles = getProfiles();
  // Remove duplicate if same sessionId or username (keep latest)
  const filtered = profiles.filter(p => p.sessionId !== profile.sessionId && p.username !== profile.username);
  // Add new profile at the front
  const updated = [profile, ...filtered];
  // Limit to last 5 profiles (optional)
  if (updated.length > 5) updated.length = 5;
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
}

// Optional: remove a profile (if you want a delete button later)
export function removeProfile(sessionId: string): void {
  const profiles = getProfiles().filter(p => p.sessionId !== sessionId);
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}