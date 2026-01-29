import { getDeviceInfo, nativeStorage } from "zmp-sdk/apis";
import { ZaloService } from "./zalo";
import {
  savePhoto,
  getPhoto,
  deletePhoto as deletePhotoFromDB,
} from "@/lib/indexed-db";

export interface AttendanceRecord {
  id: string;
  type: "check-in" | "check-out" | "pause" | "resume";
  timestamp: number;
  synced: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: any;
  photoId?: string; // ID to retrieve from IndexedDB
}

const STORAGE_KEY = "offline_attendance_records";

const DeviceStorage = {
  setItem: async (key: string, value: string) => {
    try {
      await nativeStorage.setItem(key, value);
    } catch (e) {
      console.warn(
        `[Storage] nativeStorage setItem failed for ${key}, fallback to localStorage`,
        e,
      );
      try {
        localStorage.setItem(key, value);
      } catch (localError) {
        console.error(`[Storage] localStorage setItem also failed`, localError);
      }
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await nativeStorage.getItem(key);
      if ((value as any)?.error) throw (value as any).error;
      return typeof value === "string" ? value : ((value as any)?.data ?? null);
    } catch (e) {
      console.warn(
        `[Storage] nativeStorage getItem failed for ${key}, fallback to localStorage`,
        e,
      );
      return localStorage.getItem(key);
    }
  },
};

export const OfflineAttendanceService = {
  isOnline: () => {
    return navigator.onLine;
  },

  getRecords: async (): Promise<AttendanceRecord[]> => {
    try {
      const value = await DeviceStorage.getItem(STORAGE_KEY);
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return parsed;
        } catch (err) {
          console.error("[OfflineService] JSON parse error:", err);
          return [];
        }
      }
      return (value as any) || [];
    } catch (e) {
      console.error("[OfflineService] Error reading offline records", e);
      return [];
    }
  },

  saveRecord: async (
    record: Omit<AttendanceRecord, "id" | "synced">,
    photoDataUrl?: string,
  ): Promise<boolean> => {
    const result = await OfflineAttendanceService._saveRecordInternal(
      record,
      photoDataUrl,
    );
    return !!result;
  },

  saveMetadata: async (
    record: Omit<AttendanceRecord, "id" | "synced">,
    id: string,
  ): Promise<boolean> => {
    // Save metadata only, pointing api photoId to 'id' (assuming worker saves the photo with this 'id')
    const result = await OfflineAttendanceService._saveRecordInternal(
      record,
      undefined,
      id,
      true,
    );
    return !!result;
  },

  _saveRecordInternal: async (
    record: Omit<AttendanceRecord, "id" | "synced">,
    photoDataUrl?: string,
    explicitId?: string,
    skipPhotoSave: boolean = false,
  ) => {
    const records = await OfflineAttendanceService.getRecords();
    const id =
      explicitId ||
      (self.crypto && self.crypto.randomUUID
        ? self.crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).substring(2));

    // Capture GPS and Device info if not provided
    let location = record.location;
    let deviceInfo = record.deviceInfo;

    try {
      if (!location) {
        const locResponse = await ZaloService.getUserLocation();
        location = {
          latitude: locResponse.latitude,
          longitude: locResponse.longitude,
        };
      }
    } catch (e) {
      console.warn("Failed to get location", e);
    }

    try {
      if (!deviceInfo) {
        const deviceResponse = await getDeviceInfo({});
        deviceInfo = deviceResponse;
      }
    } catch (e) {
      console.warn("Failed to get device info", e);
    }

    const newRecord: AttendanceRecord = {
      ...record,
      id,
      synced: false,
      location,
      deviceInfo,
      photoId: photoDataUrl || skipPhotoSave ? id : undefined,
    };

    try {
      // 1. Save photo to IndexedDB (if provided and not skipped)
      if (photoDataUrl && !skipPhotoSave) {
        await savePhoto(id, photoDataUrl);
      }

      // 2. Save metadata to Native Storage
      records.push(newRecord);
      await DeviceStorage.setItem(STORAGE_KEY, JSON.stringify(records));

      // Verify immediately
      const verifyRaw = await DeviceStorage.getItem(STORAGE_KEY);

      return id; // Return ID
    } catch (e) {
      console.error("[OfflineService] Error saving record", e);
      return null;
    }
  },

  getPhoto: async (id: string): Promise<string | null> => {
    return await getPhoto(id);
  },

  syncRecords: async (): Promise<number> => {
    if (!navigator.onLine) return 0;

    const records = await OfflineAttendanceService.getRecords();
    const pending = records.filter((r) => !r.synced);

    if (pending.length === 0) return 0;

    // In a real app, you'd iterate and call your API
    let successCount = 0;
    for (const record of pending) {
      try {
        const photo = record.photoId ? await getPhoto(record.photoId) : null;
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Success: remove photo from IndexedDB and mark as synced/remove from metadata
        if (record.photoId) {
          await deletePhotoFromDB(record.photoId);
        }
        successCount++;
      } catch (e) {
        console.error(`Failed to sync record ${record.id}`, e);
      }
    }

    // Update storage: remove synced records
    // For simplicity in this demo, we remove them from the list
    const remaining = records.filter(
      (r) => !pending.some((p) => p.id === r.id),
    );
    await DeviceStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    return successCount;
  },

  syncRecord: async (id: string): Promise<boolean> => {
    if (!navigator.onLine) throw new Error("No network connection");

    const records = await OfflineAttendanceService.getRecords();
    const record = records.find((r) => r.id === id);

    if (!record) return false;

    const photo = record.photoId ? await getPhoto(record.photoId) : null;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success: Remove photo and metadata
    if (record.photoId) {
      await deletePhotoFromDB(record.photoId);
    }

    const remaining = records.filter((r) => r.id !== id);
    await DeviceStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    return true;
  },

  deleteRecord: async (id: string) => {
    const records = await OfflineAttendanceService.getRecords();
    const record = records.find((r) => r.id === id);

    if (record && record.photoId) {
      await deletePhotoFromDB(record.photoId);
    }

    const remaining = records.filter((r) => r.id !== id);
    await DeviceStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  },
};
