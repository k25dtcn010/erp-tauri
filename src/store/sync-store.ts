import { create } from "zustand";
import { OfflineAttendanceService } from "@/services/offline-attendance";

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  setSyncing: (isSyncing: boolean) => void;
  refreshPendingCount: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  pendingCount: 0,
  setSyncing: (isSyncing) => set({ isSyncing }),
  refreshPendingCount: async () => {
    try {
      const records = await OfflineAttendanceService.getRecords();
      set({ pendingCount: records.length });
    } catch (err) {
      console.error("[SyncStore] Failed to update pending count", err);
    }
  },
}));
