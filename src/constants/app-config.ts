export const APP_VERSION = "1.0.0"; // Matching package.json version

export enum Platform {
  ANDROID = "android",
  IOS = "ios",
  WEB = "web",
  DESKTOP = "desktop",
}

export const getCurrentPlatform = (): Platform => {
  // Detection logic for Zalo Mini App or Tauri
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("android")) return Platform.ANDROID;
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) return Platform.IOS;

  // Check for Tauri (Desktop)
  if ((window as any).__TAURI_INTERNALS__) return Platform.DESKTOP;

  return Platform.WEB;
};

/**
 * Compare two semantic versions (v1, v2)
 * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
};
