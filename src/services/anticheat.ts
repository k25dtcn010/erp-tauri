import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import {
  checkPermissions,
  requestPermissions,
} from "@tauri-apps/plugin-geolocation";

export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  speed: number;
  provider: string;
  isMockLocation: boolean;
  isFake: boolean;
  isSuspicious: boolean;
  trustScore: number;
  satellites: number;
  warnings: string;

  // Status codes
  status: number; // 0=VALID, 1=SUSPICIOUS, 2=FAKE
}

export interface TimeReliabilityInfo {
  isCheatingTime: boolean;
  cheatingReason: string;
  reliabilityValue: number;
  systemTime: number;
  networkRealTime: number;
  timeSkew: number;
  isRebooted: boolean;
  isCleared: boolean;
  autoTimeEnabled: boolean;
  autoTimeZoneEnabled: boolean;
}

export interface SecurityInfo {
  isRooted: boolean;
  rootMethod?: string;
  deviceModel?: string;
  manufacturer?: string;
  isEmulator?: boolean;
}

export const AnticheatService = {
  /**
   * Checks if the current environment is Android native
   */
  isAndroidNative: (): boolean => {
    try {
      return platform() === "android";
    } catch {
      return false;
    }
  },

  /**
   * Initialize the Anti-Cheat system.
   * Starts location updates and reliability checks.
   * Only runs on Android.
   */
  init: async (): Promise<void> => {
    if (!AnticheatService.isAndroidNative()) {
      console.log("[Anticheat] Not Android Native - Skipping Init");
      return;
    }
    try {
      // 1. Check and request permissions
      let permission = await checkPermissions();

      if (permission.location !== "granted") {
        console.log("[Anticheat] Requesting location permissions...");
        permission = await requestPermissions(["location"]);
      }

      if (permission.location !== "granted") {
        console.warn(
          "[Anticheat] Location permission denied. Anticheat may not work correctly.",
        );
        // We continue anyway, as the plugin might handle some things gracefully or repeat request
      } else {
        console.log("[Anticheat] Location permission granted.");
      }

      // 2. Initialize Anticheat Plugin
      await invoke("init_anticheat");
      console.log("[Anticheat] Initialized successfully");
    } catch (e) {
      console.error("[Anticheat] Failed to init:", e);
    }
  },

  /**
   * Get the current secure location with anti-fake GPS analysis.
   * Returns a valid mock object on non-Android platforms.
   */
  getSecureLocation: async (): Promise<LocationInfo> => {
    if (!AnticheatService.isAndroidNative()) {
      return {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: 0,
        speed: 0,
        provider: "web",
        isMockLocation: false,
        isFake: false,
        isSuspicious: false,
        trustScore: 100,
        satellites: 0,
        warnings: "",
        status: 0,
      };
    }
    return invoke("get_secure_location");
  },

  /**
   * Check if the device time is reliable and not manipulated.
   * Returns a valid mock object on non-Android platforms.
   */
  checkTimeReliability: async (): Promise<TimeReliabilityInfo> => {
    if (!AnticheatService.isAndroidNative()) {
      return {
        isCheatingTime: false,
        cheatingReason: "",
        reliabilityValue: 100,
        systemTime: Date.now(),
        networkRealTime: Date.now(),
        timeSkew: 0,
        isRebooted: false,
        isCleared: false,
        autoTimeEnabled: true,
        autoTimeZoneEnabled: true,
      };
    }
    return invoke("check_time_reliability");
  },

  /**
   * Check if the device is rooted or compromised.
   * Returns a valid mock object on non-Android platforms.
   */
  checkRootStatus: async (): Promise<SecurityInfo> => {
    if (!AnticheatService.isAndroidNative()) {
      return {
        isRooted: false,
      };
    }
    return invoke("check_root_status");
  },

  /**
   * Run all security checks and return a consolidated status.
   * Logic is centralized here to ensure consistency between background checks and UI.
   */
  scanEnvironment: async (): Promise<{
    isSafe: boolean;
    details: {
      root: { isSafe: boolean; message: string; data: SecurityInfo };
      location: { isSafe: boolean; message: string; data: LocationInfo };
      time: { isSafe: boolean; message: string; data: TimeReliabilityInfo };
    };
  }> => {
    try {
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout checking security")), 10000),
      );

      const checksPromise = Promise.all([
        AnticheatService.checkRootStatus(),
        AnticheatService.getSecureLocation(),
        AnticheatService.checkTimeReliability(),
      ]);

      const [rootResult, locationResult, timeResult] = (await Promise.race([
        checksPromise,
        timeoutPromise,
      ])) as [SecurityInfo, LocationInfo, TimeReliabilityInfo];

      // --- 1. Root Check ---
      const isRooted = rootResult.isRooted;
      const rootMsg = isRooted
        ? "Phát hiện quyền Root/Jailbreak"
        : "Thiết bị nguyên bản";

      // --- 2. Mock/Fake Location Check ---
      const isMock = locationResult.isMockLocation || locationResult.isFake;
      const mockMsg = isMock ? "Phát hiện vị trí giả lập" : "Vị trí hợp lệ";

      // --- 3. Time Reliability Check ---
      // Consolidated logic:
      // Risk if: cheating detected OR score low OR auto-time DISABLED
      const isTimeRisk =
        timeResult.isCheatingTime ||
        timeResult.reliabilityValue < 50 ||
        !timeResult.autoTimeEnabled;

      let timeMsg = "Đã đồng bộ";
      if (isTimeRisk) {
        if (!timeResult.autoTimeEnabled) {
          timeMsg = "Vui lòng bật đồng bộ thời gian tự động";
        } else if (timeResult.reliabilityValue < 50) {
          timeMsg = "Độ tin cậy thời gian thấp";
        } else {
          timeMsg = "Thời gian hệ thống không chính xác";
        }
      }

      const overallSafe = !isRooted && !isMock && !isTimeRisk;

      return {
        isSafe: overallSafe,
        details: {
          root: { isSafe: !isRooted, message: rootMsg, data: rootResult },
          location: { isSafe: !isMock, message: mockMsg, data: locationResult },
          time: { isSafe: !isTimeRisk, message: timeMsg, data: timeResult },
        },
      };
    } catch (e) {
      console.error("[Anticheat] Scan failed:", e);
      throw e;
    }
  },
};
