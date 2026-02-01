import { useEffect, useRef, useState, useCallback } from "react";
import blusherUrl from "@/assets/blusher.png";
import lookupCustomUrl from "@/assets/lookup_custom.png";
import lookupGrayUrl from "@/assets/lookup_gray.png";
import lookupLightUrl from "@/assets/lookup_light.png";
import lookupOriginUrl from "@/assets/lookup_origin.png";
import lookupSkinUrl from "@/assets/lookup_skin.png";
import mouthUrl from "@/assets/mouth.png";
import gpupixelJsContent from "@/assets/gpupixel_app.js?raw";
import gpupixelWasmUrl from "@/assets/gpupixel.wasm?url";

let wasmModule: any = null;
let loadPromise: Promise<any> | null = null;
let glCanvas: HTMLCanvasElement | null = null;

const RESOURCES = [
  { name: "blusher.png", url: blusherUrl },
  { name: "lookup_custom.png", url: lookupCustomUrl },
  { name: "lookup_gray.png", url: lookupGrayUrl },
  { name: "lookup_light.png", url: lookupLightUrl },
  { name: "lookup_origin.png", url: lookupOriginUrl },
  { name: "lookup_skin.png", url: lookupSkinUrl },
  { name: "mouth.png", url: mouthUrl },
];

export const GPUPixelLoader = {
  getModule: () => wasmModule,
  getGlCanvas: () => glCanvas,

  init: async () => {
    if (wasmModule) return wasmModule;
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      // 1. Tạo Canvas WebGL ẩn
      if (!document.getElementById("gpupixel_canvas")) {
        glCanvas = document.createElement("canvas");
        glCanvas.id = "gpupixel_canvas";
        glCanvas.width = 1280;
        glCanvas.height = 720;
        glCanvas.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
        document.body.appendChild(glCanvas);
      } else {
        glCanvas = document.getElementById(
          "gpupixel_canvas",
        ) as HTMLCanvasElement;
      }

      const testCtx =
        glCanvas.getContext("webgl2") || glCanvas.getContext("webgl");
      if (!testCtx) {
        reject(new Error("Trình duyệt không hỗ trợ WebGL"));
        return;
      }

      // 2. Setup Config
      const ModuleConfig = {
        canvas: glCanvas,
        locateFile: (path: string) => {
          if (path.endsWith(".wasm")) {
            return gpupixelWasmUrl;
          }
          return path;
        },
        locateCanvasForWebGL: () => glCanvas,
        onRuntimeInitialized: async function () {
          // @ts-ignore
          const m = window.Module;

          try {
            // 3. Virtual FS Setup
            // Dựa vào file JS: Dùng FS_createPath (có gạch dưới)
            try {
              // @ts-ignore
              if (typeof m.FS_createPath === "function") {
                m.FS_createPath("/", "gpupixel", true, true);
                m.FS_createPath("/gpupixel", "res", true, true);
              } else {
                console.warn("FS_createPath not found on Module");
              }
            } catch (e) {
              /* Ignore path exists error */
            }

            // 4. Load Resources
            await Promise.all(
              RESOURCES.map(async (resItem) => {
                // Fetch dữ liệu binary từ URL import
                const resp = await fetch(resItem.url);
                if (!resp.ok) throw new Error(`404: ${resItem.name}`);

                const buf = await resp.arrayBuffer();
                const data = new Uint8Array(buf);

                // Dựa vào file JS: Dùng FS_createDataFile (có gạch dưới)
                // @ts-ignore
                m.FS_createDataFile(
                  "/gpupixel/res",
                  resItem.name,
                  data,
                  true, // canRead
                  true, // canWrite
                  true, // canOwn
                );
              }),
            );

            // 5. Init Core
            const res = m.ccall("Init", "number", ["string"], ["/gpupixel"]);
            if (res < 0) throw new Error(`Init failed code: ${res}`);

            wasmModule = m;
            resolve(m);
          } catch (err) {
            console.error(err);
            reject(err);
          }
        },
      };

      // Gán vào window
      // @ts-ignore
      window.Module = ModuleConfig;

      // 6. Load Script
      try {
        // KỸ THUẬT CHÈN LOG VÀO TRONG MODULE APP
        // Ta cộng thêm dòng log vào ngay đầu nội dung file JS lấy được
        const debugHeader = ``;

        // Nối chuỗi: Header log + Nội dung gốc
        const finalJsContent = debugHeader + "\n" + gpupixelJsContent;

        const blob = new Blob([finalJsContent], { type: "text/javascript" });
        const scriptUrl = URL.createObjectURL(blob);

        const script = document.createElement("script");
        script.src = scriptUrl;

        // Log khi script được trình duyệt tải xong (chưa chắc đã chạy xong logic, nhưng đã load file)
        script.onload = () => {
          URL.revokeObjectURL(scriptUrl); // Dọn dẹp bộ nhớ
        };

        script.onerror = (e) => {
          console.error("[GPUPixelLoader] Lỗi khi load script từ Blob:", e);
          URL.revokeObjectURL(scriptUrl);
          reject(new Error("Failed to inject gpupixel script blob"));
        };

        document.body.appendChild(script);
      } catch (e) {
        console.error(
          "[GPUPixelLoader] Exception trong quá trình tạo Blob:",
          e,
        );
        reject(e);
      }
    });

    return loadPromise;
  },
};

interface UseGPUPixelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mediaStream: MediaStream | null;
  smoothing?: number;
  whitening?: number;
  enabled?: boolean;
}

export const useGPUPixel = ({
  canvasRef,
  mediaStream,
  smoothing = 3,
  whitening = 4,
  enabled = true,
}: UseGPUPixelProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef<number>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Refs for WASM memory reuse
  const wasmBufferRef = useRef<{ ptr: number; size: number } | null>(null);
  // Refs cho params để tránh dependency loop
  const paramsRef = useRef({ smoothing, whitening, enabled });

  useEffect(() => {
    return () => {
      // Cleanup WASM buffer on unmount
      const module = GPUPixelLoader.getModule();
      if (module && wasmBufferRef.current) {
        module._free(wasmBufferRef.current.ptr);
        wasmBufferRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    paramsRef.current = { smoothing, whitening, enabled };

    // Cập nhật params realtime nếu đã load
    const module = GPUPixelLoader.getModule();
    if (isLoaded && module && module._SetBeautyParams && enabled) {
      module._SetBeautyParams(smoothing, whitening);
    }
  }, [smoothing, whitening, enabled, isLoaded]);

  // 1. Init
  useEffect(() => {
    GPUPixelLoader.init()
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error("GPUPixel Load Error:", err);
        setError(err.message);
      });
  }, []);

  // 2. Setup Hidden Video
  useEffect(() => {
    if (!mediaStream) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      return;
    }

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = mediaStream;

    video.onloadedmetadata = () => {
      video.play().catch((e) => console.warn("Video play interrupted", e));
    };

    videoRef.current = video;

    return () => {
      video.pause();
      video.srcObject = null;
    };
  }, [mediaStream]);

  // 3. Render Loop
  const processFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Nếu chưa sẵn sàng, request frame tiếp theo và thoát
    if (!canvas || !video || video.readyState < 2) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    // Sync kích thước
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      // Sync GL canvas nếu cần thiết (thường module tự handle nhưng ta set lại cho chắc)
      const glCanvas = GPUPixelLoader.getGlCanvas();
      if (glCanvas) {
        glCanvas.width = width;
        glCanvas.height = height;
      }
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return; // Should rarely happen

    const module = GPUPixelLoader.getModule();
    const shouldFilter =
      isLoaded && module && paramsRef.current.enabled && !error;

    if (shouldFilter) {
      try {
        // Vẽ video gốc để lấy dữ liệu
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        const dataLen = imageData.data.length;

        // --- REUSE WASM BUFFER ---
        if (!wasmBufferRef.current || wasmBufferRef.current.size !== dataLen) {
          if (wasmBufferRef.current) {
            module._free(wasmBufferRef.current.ptr);
          }
          wasmBufferRef.current = {
            ptr: module._malloc(dataLen),
            size: dataLen
          };
        }
        const ptr = wasmBufferRef.current.ptr;

        // Tìm kiếm HEAPU8 từ nhiều nguồn: từ module, từ global window, hoặc từ memory buffer
        let memoryView = module.HEAPU8;
        if (!memoryView && (window as any).HEAPU8) {
          memoryView = (window as any).HEAPU8;
        }
        if (!memoryView && module.buffer) {
          memoryView = new Uint8Array(module.buffer);
        }
        if (!memoryView && module.wasmMemory) {
          memoryView = new Uint8Array(module.wasmMemory.buffer);
        }

        if (memoryView) {
          // Copy dữ liệu vào WASM Memory một cách an toàn
          memoryView.set(imageData.data, ptr);

          // Xử lý
          module._ProcessImage(ptr, width, height);

          // Vẽ lại từ GL Canvas
          const glCanvas = GPUPixelLoader.getGlCanvas();
          if (glCanvas) {
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(width, 0);
            ctx.scale(-1, 1); // Lật ngang
            ctx.drawImage(glCanvas, 0, 0, width, height);
            ctx.restore();
          }
        } else {
          if (Math.random() < 0.01) {
            console.warn("WASM Memory (HEAPU8) not found");
          }
          // Fallback vẽ thường
          ctx.drawImage(video, 0, 0, width, height);
        }
        // ---------------------
      } catch (e) {
        // Chỉ log error một lần hoặc throttle để tránh treo trình duyệt
        if (Math.random() < 0.01)
          console.warn("Render loop error (throttled):", e);

        // Fallback về video gốc để UI không bị đen
        ctx.drawImage(video, 0, 0, width, height);
      }
    } else {
      // Chế độ không filter (Loading hoặc Disabled)
      ctx.drawImage(video, 0, 0, width, height);
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [isLoaded, error]);

  // Kích hoạt loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(processFrame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [processFrame]); // processFrame được memoize, chỉ thay đổi khi isLoaded/error đổi

  return {
    isLoaded,
    error,
  };
};
