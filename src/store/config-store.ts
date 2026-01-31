import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getApiV3Configs } from "@/client-timekeeping/sdk.gen";
import { Platform, APP_VERSION, compareVersions, getCurrentPlatform } from "@/constants/app-config";

export interface AppBadge {
  id: string;
  type: "notice" | "version_update" | "feature_highlight";
  title: string;
  content: string;
  isClosable: boolean;
  actionUrl?: string;
  version?: string; // Target version for update
  platforms?: Platform[]; // Targeted platforms
  minVersion?: string; // Show only if APP_VERSION >= minVersion
  maxVersion?: string; // Show only if APP_VERSION <= maxVersion
}

export interface AppConfigState {
  features: {
    enableFaceVerification: boolean;
    enableGpsAttendance: boolean;
    enableAndroidRestriction: boolean;
    [key: string]: boolean;
  };
  badges: AppBadge[];
  androidAppLink: string; // Link app Android có thể cấu hình từ Admin
  dismissedBadgeIds: string[];
  snoozedBadgeIds: Record<string, number>; // { [badgeId: string]: expiresAtTimestamp }
  isLoading: boolean;
  fetchConfigs: () => Promise<void>;
  dismissBadge: (id: string, snoozeFor24h?: boolean) => void;
}

export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set, _get) => ({
      features: {
        enableFaceVerification: true,
        enableGpsAttendance: true,
        enableAndroidRestriction: false,
      },
      badges: [],
      androidAppLink: "",
      dismissedBadgeIds: [],
      snoozedBadgeIds: {},
      isLoading: false,

      fetchConfigs: async () => {
        set({ isLoading: true });
        try {
          const res = await getApiV3Configs();
          if (res.data && res.data.data) {
            const { configs, badges } = res.data.data;
            const currentPlatform = getCurrentPlatform();

            // Filter badges based on platform and version
            const filteredBadges = (badges as AppBadge[]).filter((badge) => {
              // 1. Filter by Platform
              if (badge.platforms && badge.platforms.length > 0) {
                if (!badge.platforms.includes(currentPlatform)) return false;
              }

              // 2. Filter by Min Version (Current >= Min)
              if (badge.minVersion && compareVersions(APP_VERSION, badge.minVersion) < 0) {
                return false;
              }

              // 3. Filter by Max Version (Current <= Max)
              if (badge.maxVersion && compareVersions(APP_VERSION, badge.maxVersion) > 0) {
                return false;
              }

              return true;
            });

            set({
              features: configs.features,
              androidAppLink: configs.androidAppLink,
              badges: filteredBadges,
            });
          }
        } catch (error) {
          console.error("Failed to fetch configs:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      dismissBadge: (id, snoozeFor24h) =>
        set((state) => {
          if (snoozeFor24h) {
            const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
            return {
              snoozedBadgeIds: { ...state.snoozedBadgeIds, [id]: expiresAt },
            };
          }
          return {
            dismissedBadgeIds: [...state.dismissedBadgeIds, id],
          };
        }),
    }),
    {
      name: "app-configs-storage",
      partialize: (state) => ({
        snoozedBadgeIds: state.snoozedBadgeIds,
        androidAppLink: state.androidAppLink,
      }),
    },
  ),
);
