import {
  getStorage,
  setStorage,
  getLocation,
  getDeviceInfo,
} from "zmp-sdk/apis";
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

export const OfflineAttendanceService = {
  isOnline: () => {
    return navigator.onLine;
  },

  getRecords: async (): Promise<AttendanceRecord[]> => {
    try {
      const data = await getStorage({ keys: [STORAGE_KEY] });
      return data[STORAGE_KEY] || [];
    } catch (e) {
      console.error("Error reading offline records from native storage", e);
      return [];
    }
  },

  saveRecord: async (
    record: Omit<AttendanceRecord, "id" | "synced">,
    photoDataUrl?: string,
  ) => {
    const records = await OfflineAttendanceService.getRecords();
    const id =
      self.crypto && self.crypto.randomUUID
        ? self.crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).substring(2);

    // Capture GPS and Device info if not provided
    let location = record.location;
    let deviceInfo = record.deviceInfo;

    try {
      if (!location) {
        const locResponse = await getLocation({});
        location = {
          latitude: Number(locResponse.latitude),
          longitude: Number(locResponse.longitude),
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
      photoId: photoDataUrl ? id : undefined,
    };

    try {
      // 1. Save photo to IndexedDB
      if (photoDataUrl) {
        await savePhoto(id, photoDataUrl);
      }

      // 2. Save metadata to Native Storage
      records.push(newRecord);
      await setStorage({
        data: {
          [STORAGE_KEY]: records,
        },
      });
      return true;
    } catch (e) {
      console.error("Error saving record", e);
      return false;
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

    console.log("[Sync] Uploading pending records:", pending);

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
    await setStorage({
      data: {
        [STORAGE_KEY]: remaining,
      },
    });

    return successCount;
  },

  syncRecord: async (id: string): Promise<boolean> => {
    if (!navigator.onLine) throw new Error("No network connection");

    const records = await OfflineAttendanceService.getRecords();
    const record = records.find((r) => r.id === id);

    if (!record) return false;

    console.log("[Sync] Uploading single record:", record);

    const photo = record.photoId ? await getPhoto(record.photoId) : null;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success: Remove photo and metadata
    if (record.photoId) {
      await deletePhotoFromDB(record.photoId);
    }

    const remaining = records.filter((r) => r.id !== id);
    await setStorage({
      data: {
        [STORAGE_KEY]: remaining,
      },
    });

    return true;
  },

  deleteRecord: async (id: string) => {
    const records = await OfflineAttendanceService.getRecords();
    const record = records.find((r) => r.id === id);

    if (record && record.photoId) {
      await deletePhotoFromDB(record.photoId);
    }

    const remaining = records.filter((r) => r.id !== id);
    await setStorage({
      data: {
        [STORAGE_KEY]: remaining,
      },
    });
  },
};
