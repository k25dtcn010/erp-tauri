import { getDeviceInfo, nativeStorage } from "zmp-sdk/apis";
import { ZaloService } from "./zalo";
import {
  savePhoto,
  getPhoto,
  deletePhoto as deletePhotoFromDB,
} from "@/lib/indexed-db";
import {
  postApiV3FilesUpload,
  postApiV3AttendanceCheckInAsync,
  postApiV3AttendanceCheckOutAsync,
} from "@/client-timekeeping/sdk.gen";

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
  metadataSynced?: boolean;
}

const STORAGE_KEY = "offline_attendance_records";

const DeviceStorage = {
  setItem: (key: string, value: string) => {
    try {
      nativeStorage.setItem(key, value);
    } catch (e) {
      try {
        localStorage.setItem(key, value);
      } catch (localError) {
        console.error(`[Storage] localStorage setItem also failed`, localError);
      }
    }
  },
  getItem: (key: string): string | null => {
    try {
      const value = nativeStorage.getItem(key);
      if ((value as any)?.error) throw (value as any).error;
      return typeof value === "string" ? value : ((value as any)?.data ?? null);
    } catch (e) {
      return localStorage.getItem(key);
    }
  },
};

export const OfflineAttendanceService = {
  isOnline: () => {
    return navigator.onLine;
  },

  getRecords: (): AttendanceRecord[] => {
    try {
      const value = DeviceStorage.getItem(STORAGE_KEY);
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return parsed;
        } catch (err) {
          return [];
        }
      }
      return (value as any) || [];
    } catch (e) {
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
      true,
    );
    return !!result;
  },

  _saveRecordInternal: async (
    record: Omit<AttendanceRecord, "id" | "synced">,
    photoDataUrl?: string,
    explicitId?: string,
    skipPhotoSave: boolean = false,
    metadataSynced: boolean = false,
  ) => {
    const records = OfflineAttendanceService.getRecords();
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
    } catch (e) {}

    try {
      if (!deviceInfo) {
        const deviceResponse = await getDeviceInfo({});
        deviceInfo = deviceResponse;
      }
    } catch (e) {}

    const newRecord: AttendanceRecord = {
      ...record,
      id,
      synced: false,
      location,
      deviceInfo,
      photoId: photoDataUrl || skipPhotoSave ? id : undefined,
      metadataSynced,
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
      const verifyRaw = DeviceStorage.getItem(STORAGE_KEY);

      return id; // Return ID
    } catch (e) {
      return null;
    }
  },

  getPhoto: async (id: string): Promise<string | null> => {
    return await getPhoto(id);
  },

  syncRecords: async (): Promise<number> => {
    if (!navigator.onLine) return 0;

    const records = OfflineAttendanceService.getRecords();
    const pending = records.filter((r) => !r.synced);

    if (pending.length === 0) return 0;

    let successCount = 0;
    // We will build a new list of records to keep (failed ones + synced ones that we mark synced)
    // Actually we usually remove synced records from this list entirely or mark them synced.
    // The current logic removes them.

    const successfullySyncedIds: string[] = [];

    for (const record of pending) {
      try {
        let serverPhotoId: string | null = null;

        // 1. Upload Photo if exists
        if (record.photoId) {
          const base64 = await getPhoto(record.photoId);
          if (base64) {
            const blob = dataURItoBlob(base64);
            const formData = new FormData();
            formData.append("file", blob, "offline-attendance.jpg");

            // Use SDK to upload
            // Note: We cast body to any because SDK generation for FormData can be tricky with types
            const uploadRes = await postApiV3FilesUpload({
              body: formData as any,
            });

            if (uploadRes.data && (uploadRes.data as any).fid) {
              serverPhotoId = (uploadRes.data as any).fid;
            }
          }
        }

        // 2. Call Check-in/Check-out Async API
        const payload = {
          latitude: record.location?.latitude,
          longitude: record.location?.longitude,
          photoId: serverPhotoId,
          eventTime: new Date(record.timestamp).toISOString(),
        };

        if (record.type === "check-in") {
          await postApiV3AttendanceCheckInAsync({ body: payload });
        } else if (record.type === "check-out") {
          await postApiV3AttendanceCheckOutAsync({ body: payload });
        } else {
        }

        // 3. Cleanup Local Data
        if (record.photoId) {
          await deletePhotoFromDB(record.photoId);
        }
        successfullySyncedIds.push(record.id);
        successCount++;
      } catch (e) {
        console.error(`Failed to sync record ${record.id}`, e);
        // Do not add to successfullySyncedIds, so it remains in storage
      }
    }

    // Update storage: Keep records that were NOT successfully synced
    // (We also keep previously synced records if we wanted to keep history, but here we just purge pending)
    const remaining = records.filter(
      (r) => !successfullySyncedIds.includes(r.id),
    );
    await DeviceStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    return successCount;
  },

  syncRecord: async (id: string): Promise<boolean> => {
    if (!navigator.onLine) throw new Error("No network connection");

    const records = await OfflineAttendanceService.getRecords();
    const record = records.find((r) => r.id === id);

    if (!record) return false;

    try {
      let serverPhotoId: string | null = null;

      // 1. Upload Photo if exists
      if (record.photoId) {
        const base64 = await getPhoto(record.photoId);
        if (base64) {
          const blob = dataURItoBlob(base64);
          const formData = new FormData();
          formData.append("file", blob, "offline-attendance.jpg");

          const uploadRes = await postApiV3FilesUpload({
            body: formData as any,
          });

          if (uploadRes.data && (uploadRes.data as any).fid) {
            serverPhotoId = (uploadRes.data as any).fid;
          }
        }
      }

      // 2. Call Async API
      const payload = {
        latitude: record.location?.latitude,
        longitude: record.location?.longitude,
        photoId: serverPhotoId,
        eventTime: new Date(record.timestamp).toISOString(),
      };

      if (record.type === "check-in") {
        await postApiV3AttendanceCheckInAsync({ body: payload });
      } else if (record.type === "check-out") {
        await postApiV3AttendanceCheckOutAsync({ body: payload });
      }

      // 3. Cleanup
      if (record.photoId) {
        await deletePhotoFromDB(record.photoId);
      }

      const remaining = records.filter((r) => r.id !== id);
      await DeviceStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

      return true;
    } catch (e) {
      console.error(`Failed to sync record ${id}`, e);
      throw e;
    }
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

function dataURItoBlob(dataURI: string) {
  const split = dataURI.split(",");
  const byteString = atob(split[1]);
  const mimeString = split[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
