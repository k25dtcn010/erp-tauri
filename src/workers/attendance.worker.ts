/* eslint-disable no-restricted-globals */

// --- INLINED INDEXEDDB LOGIC (Required for Blob Workers) ---
const DB_NAME = "TimekeepingDB";
const STORE_NAME = "attendance_photos";
const DB_VERSION = 1;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

async function savePhoto(id: string, photoDataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, photoDataUrl });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- TYPES ---
interface WatermarkOptions {
  employeeCode: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp?: number;
}

interface WorkerMessage {
  type: "PROCESS_ATTENDANCE";
  payload: {
    images: string[];
    metadata: {
      location: {
        latitude: number;
        longitude: number;
        address?: string;
      };
      deviceInfo: any;
      employeeCode: string;
      timestamp: number;
    };
    recordId: string; // ID for offline record
    eventId?: string; // ID from online async check-in
    apiConfig: {
      baseUrl: string;
      token?: string;
      companyId?: string;
      userId?: string;
      employeeId?: string;
    };
  };
}

// --- HELPER: Load Image in Worker ---
const loadImageBitmap = async (
  base64OrBlob: string | Blob,
): Promise<ImageBitmap> => {
  let blob: Blob;
  if (typeof base64OrBlob === "string") {
    const response = await fetch(base64OrBlob);
    blob = await response.blob();
  } else {
    blob = base64OrBlob;
  }
  return await createImageBitmap(blob);
};

// --- HELPER: Capitalize ---
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// --- WATERMARK LOGIC (Adapted for Worker) ---
const addWatermark = async (
  imageSource: string,
  options: WatermarkOptions,
): Promise<Blob> => {
  if (!options) {
    console.error("[Worker] Watermark options are missing or undefined");
    throw new Error("Watermark options missing");
  }
  console.log("[Worker] addWatermark options:", JSON.stringify(options));

  // 1. Load Image
  const originalImage = await loadImageBitmap(imageSource);
  const originalWidth = originalImage.width;
  const originalHeight = originalImage.height;

  // 2. Logic Resize
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (originalWidth >= 1000) {
    targetWidth = 1280;
    targetHeight = Math.round((targetWidth * originalHeight) / originalWidth);
  }

  // 3. Create OffscreenCanvas
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Cannot create canvas context");

  // Enable high quality image smoothing (might depend on browser support in worker)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 4. Draw Image
  ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

  // 5. Calculate Metrics
  const minDimension = Math.min(targetWidth, targetHeight);

  const fsTime = Math.floor(minDimension * 0.14);
  const fsDate = Math.floor(minDimension * 0.045);
  const fsCode = Math.floor(minDimension * 0.035);
  const fsCoords = Math.floor(minDimension * 0.03);

  const padding = Math.floor(minDimension * 0.04);
  const lineGap = Math.floor(minDimension * 0.015);
  const blockGap = Math.floor(minDimension * 0.02);
  const barWidth = Math.max(2.0, Math.floor(minDimension * 0.008));
  const barGap = Math.floor(fsTime * 0.45);

  // 6. Prepare Text
  const dateObj = options.timestamp ? new Date(options.timestamp) : new Date();

  // Time: HH:MM
  const timeStr = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Date: dd/MM/yyyy
  const dateLine = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Weekday
  const weekdayRaw = dateObj.toLocaleDateString("vi-VN", { weekday: "long" });
  const weekdayLine = capitalizeFirstLetter(weekdayRaw);

  const codeStr = options.employeeCode;
  let locationStr = "";
  if (options.location?.address) {
    locationStr = options.location.address;
  } else if (
    options.location &&
    typeof options.location.latitude === "number" &&
    typeof options.location.longitude === "number"
  ) {
    locationStr = `${options.location.latitude.toFixed(6)}, ${options.location.longitude.toFixed(6)}`;
  } else {
    locationStr = "Unknown Location";
  }

  // 7. Draw Shadow
  const shadowHeight = targetHeight * 0.4;
  const gradient = ctx.createLinearGradient(
    0,
    targetHeight - shadowHeight,
    0,
    targetHeight,
  );
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.3, "rgba(0,0,0,0.2)");
  gradient.addColorStop(1, "rgba(0,0,0,0.85)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, targetHeight - shadowHeight, targetWidth, shadowHeight);

  // 8. Font Config
  const fontFamily = "Roboto, Arial, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "white";

  // --- DRAWING FROM BOTTOM UP ---
  let currentBaselineY = targetHeight - padding;

  // A. Location
  if (locationStr) {
    ctx.font = `${fsCoords}px ${fontFamily}`;
    ctx.fillStyle = "#DDDDDD";
    ctx.fillText(locationStr, padding, currentBaselineY);
    currentBaselineY -= fsCoords + lineGap;
  }

  // B. Employee Code
  ctx.font = `${fsCode}px ${fontFamily}`;
  ctx.fillStyle = "white";
  ctx.fillText(codeStr, padding, currentBaselineY);

  // C. Time Block Origin
  const yTimeBlockOrigin = currentBaselineY - fsCode - blockGap;

  // D. Time
  ctx.font = `bold ${fsTime}px ${fontFamily}`;
  ctx.fillText(timeStr, padding, yTimeBlockOrigin);

  // E. Yellow Bar
  const estimatedTimeW = fsTime * 0.55 * 5;
  const xBar = padding + estimatedTimeW + barGap;
  const barTopY = yTimeBlockOrigin - fsTime * 0.72;
  const barHeight = fsTime * 0.75;

  ctx.fillStyle = "#FFC107";
  ctx.fillRect(xBar, barTopY, barWidth, barHeight);

  // F. Date & Weekday
  const xDate = xBar + barWidth + barGap;
  ctx.fillStyle = "white";

  const yDateLineBaseline = yTimeBlockOrigin - fsTime * 0.42;
  ctx.font = `${fsDate}px ${fontFamily}`;
  ctx.fillText(dateLine, xDate, yDateLineBaseline);

  ctx.fillText(weekdayLine, xDate, yTimeBlockOrigin);

  // 9. Export
  return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
};

// --- WORKER HANDLER ---
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  console.log("[Worker] 📥 Đã nhận được message từ Main Thread:", e.data.type);
  if (e.data.type === "PROCESS_ATTENDANCE") {
    console.log("[Worker] 📦 Payload chi tiết:", JSON.stringify(e.data.payload, null, 2));
    const { images, metadata, recordId, eventId, apiConfig } = e.data.payload;
    const base64Image = images[0]; // Assuming single image for now

    try {
      // 1. Watermark
      const watermarkedBlob = await addWatermark(base64Image, {
        employeeCode: metadata.employeeCode,
        location: metadata.location,
        timestamp: metadata.timestamp,
      });

      // 2. Save to Offline DB (IndexedDB)
      const reader = new FileReader();
      reader.readAsDataURL(watermarkedBlob);
      await new Promise((resolve) => {
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await savePhoto(recordId, dataUrl);
          resolve(null);
        };
      });

      // 3. Upload & Update Event (if online and eventId provided)
      let isSynced = false;
      if (eventId && apiConfig.baseUrl) {
        try {
          // Prepare Headers
          const headers: Record<string, string> = {};
          if (apiConfig.token) {
            headers["Authorization"] = `Bearer ${apiConfig.token}`;
          }
          if (apiConfig.companyId) {
            headers["x-company-id"] = apiConfig.companyId;
          }
          if (apiConfig.userId) {
            headers["X-User-ID"] = apiConfig.userId;
          }
          if (apiConfig.employeeId) {
            headers["X-Employee-ID"] = apiConfig.employeeId;
          }

          // A. Upload
          const formData = new FormData();
          formData.append("file", watermarkedBlob, "attendance.jpg");

          const uploadRes = await fetch(
            `${apiConfig.baseUrl}/api/v3/files/upload`,
            {
              method: "POST",
              headers: {
                ...headers,
                // 'Content-Type': 'multipart/form-data' // Fetch sets boundary automatically
              },
              body: formData,
            },
          );

          if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.status}`);
          }

          const uploadData = await uploadRes.json();

          // Use the 'fid' returned from the upload API
          const photoId = uploadData.fid || uploadData.id;

          if (photoId) {
            // B. Update Event

            // Try the SDK-defined path first
            const updateUrl = `${apiConfig.baseUrl}/api/v3/attendance/events/${eventId}/photo`;

            const updateRes = await fetch(updateUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ photoId }),
            });

            if (updateRes.ok) {
              isSynced = true;
            } else {
              const errorText = await updateRes.text();
              console.warn(
                "[Worker] Event photo update failed (attendance path)",
                updateRes.status,
                errorText,
              );

              // Fallback to simpler path if the first one fails with 404
              if (updateRes.status === 404) {
                const fallbackUrl = `${apiConfig.baseUrl}/api/v3/events/${eventId}/photo`;
                const fallbackRes = await fetch(fallbackUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...headers,
                  },
                  body: JSON.stringify({ photoId }),
                });

                if (fallbackRes.ok) {
                  isSynced = true;
                } else {
                  console.error(
                    "[Worker] Event photo update failed (fallback path)",
                    fallbackRes.status,
                    await fallbackRes.text(),
                  );
                }
              }
            }
          } else {
            console.warn(
              "[Worker] No photo ID returned from upload. Data received:",
              uploadData,
            );
          }
        } catch (err) {
          console.error("[Worker] Online background processing failed:", err);
          // Non-fatal, offline photo is already saved
        }
      } else {
        console.log("[Worker] ℹ️ Skipping online sync (late photo upload) because eventId or baseUrl is missing.", {
          eventId,
          baseUrl: apiConfig.baseUrl
        });
      }

      // Done
      self.postMessage({ type: "SUCCESS", recordId, synced: isSynced });
    } catch (err) {
      console.error("[Worker] Processing failed:", err);
      self.postMessage({ type: "ERROR", recordId, error: err });
    }
  }
};
