export interface AttendanceRecord {
  id: string;
  type: "check-in" | "check-out";
  timestamp: number;
  synced: boolean;
  photoDataUrl?: string; // Optional: Store photo if needed and size permits
}

const STORAGE_KEY = "offline_attendance_records";

export const OfflineAttendanceService = {
  isOnline: () => {
    return navigator.onLine;
  },

  getRecords: (): AttendanceRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading offline records", e);
      return [];
    }
  },

  saveRecord: (record: Omit<AttendanceRecord, "id" | "synced">) => {
    const records = OfflineAttendanceService.getRecords();
    const newRecord: AttendanceRecord = {
      ...record,
      id:
        self.crypto && self.crypto.randomUUID
          ? self.crypto.randomUUID()
          : Date.now().toString() + Math.random().toString(36).substring(2),
      synced: false,
    };

    try {
      records.push(newRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      console.error("Storage quota exceeded", e);
      return false;
    }
  },

  clearRecords: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  syncRecords: async (): Promise<number> => {
    if (!navigator.onLine) return 0;

    const records = OfflineAttendanceService.getRecords();
    const pending = records.filter((r) => !r.synced);

    if (pending.length === 0) return 0;

    console.log("[Sync] Uploading pending records:", pending);

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Determine successful syncs (simulate 100% success for bulk sync for now)
    // In real scenario, we might iterate and try each
    const successIds = pending.map((p) => p.id);

    // Update storage
    const remaining = records.filter((r) => !successIds.includes(r.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    return successIds.length;
  },

  syncRecord: async (id: string): Promise<boolean> => {
    if (!navigator.onLine) throw new Error("No network connection");

    // FIND record
    const records = OfflineAttendanceService.getRecords();
    const record = records.find((r) => r.id === id);

    if (!record) return false;

    console.log("[Sync] Uploading single record:", record);

    // Simulate API call with latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate random failure for demo (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Network timeout");
    }

    // Success: Remove from storage
    const remaining = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    return true;
  },

  deleteRecord: (id: string) => {
    const records = OfflineAttendanceService.getRecords();
    const remaining = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  },
};
