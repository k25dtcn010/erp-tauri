/**
 * GPUPixel Adapter for Flutter Web
 * Handles lazy loading of WASM module and camera processing
 */
window.GPUPixelAdapter = {
  wasmModule: null,
  isActive: false,
  videoElement: null,
  canvasContext: null,
  displayCanvas: null,
  glCanvas: null,
  requestID: null,
  isModuleLoading: false,
  moduleLoadPromise: null,
  // Default beauty parameters (will be applied on init)
  // Moderate values for natural look without being too artificial
  defaultSmoothing: 3, // Range 0-10, subtle smoothing for natural skin
  defaultWhitening: 4, // Range 0-10, light whitening to avoid looking pale

  /**
   * Loads the WASM module dynamically
   * Must be called AFTER the canvas exists in DOM
   */
  loadModule: function (displayCanvasId) {
    if (this.moduleLoadPromise) {
      return this.moduleLoadPromise;
    }

    const self = this;
    this.isModuleLoading = true;

    this.moduleLoadPromise = new Promise((resolve, reject) => {
      console.log("[GPUPixel] Loading WASM module...");

      // Create a WebGL canvas with the ID that GPUPixel expects
      // GPUPixel internally looks for 'gpupixel_canvas' or uses Module.canvas
      let glCanvas = document.getElementById("gpupixel_canvas");
      if (!glCanvas) {
        glCanvas = document.createElement("canvas");
        glCanvas.id = "gpupixel_canvas";
        glCanvas.width = 640;
        glCanvas.height = 480;
        glCanvas.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
        document.body.appendChild(glCanvas);
        console.log("[GPUPixel] Created gpupixel_canvas element");
      }
      self.glCanvas = glCanvas;

      // Pre-create WebGL context to ensure it works
      const testCtx =
        glCanvas.getContext("webgl2") || glCanvas.getContext("webgl");
      if (!testCtx) {
        reject(new Error("WebGL not supported in this browser"));
        return;
      }
      console.log("[GPUPixel] WebGL context test passed");

      // Configure Module BEFORE loading app.js
      window.Module = window.Module || {};
      window.Module.canvas = glCanvas;

      // Override the canvas lookup to always return our canvas
      window.Module.locateCanvasForWebGL = function () {
        return glCanvas;
      };

      window.Module.onRuntimeInitialized = async function () {
        console.log("[GPUPixel] WASM Runtime Initialized");
        
        // Manual resource loading since we removed app.data
        const resourceFiles = [
          "blusher.png",
          "lookup_custom.png",
          "lookup_gray.png",
          "lookup_light.png",
          "lookup_origin.png",
          "lookup_skin.png",
          "mouth.png"
        ];

        try {
          console.log("[GPUPixel] Loading separate resource files to FS...");
          
          // Ensure directory exists in WASM FS
          try {
            window.Module.FS_createPath("/", "gpupixel", true, true);
            window.Module.FS_createPath("/gpupixel", "res", true, true);
          } catch (e) {}

          // Load each file
          await Promise.all(resourceFiles.map(async (filename) => {
            const resp = await fetch(`./gpupixel/res/${filename}`);
            if (!resp.ok) throw new Error(`Failed to fetch ${filename}`);
            const buf = await resp.arrayBuffer();
            const data = new Uint8Array(buf);
            window.Module.FS_createDataFile("/gpupixel/res", filename, data, true, true, true);
          }));
          
          console.log("[GPUPixel] All resources loaded successfully");
          self.wasmModule = window.Module;
          self.isModuleLoading = false;
          resolve(self.wasmModule);
        } catch (err) {
          console.error("[GPUPixel] Resource loading error:", err);
          self.isModuleLoading = false;
          reject(err);
        }
      };

      // Load app.js dynamically
      const script = document.createElement("script");
      script.src = "gpupixel_app.js";
      script.onerror = function (e) {
        self.isModuleLoading = false;
        reject(new Error("Failed to load app.js"));
      };
      document.body.appendChild(script);
    });

    return this.moduleLoadPromise;
  },

  init: function () {
    console.log("GPUPixelAdapter init called (no-op, use loadModule instead)");
  },

  startCamera: function (canvasId) {
    console.log("[GPUPixel] startCamera called for:", canvasId);

    // If already active and processing, just continue (don't restart everything)
    if (this.isActive && this.requestID) {
      console.log("[GPUPixel] Camera already active, continuing...");
      return;
    }

    // Reset state for restart
    this.isActive = false;
    if (this.requestID) {
      cancelAnimationFrame(this.requestID);
      this.requestID = null;
    }

    const self = this;
    let attempts = 0;
    const maxAttempts = 20;

    function checkCanvas() {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        attempts++;
        if (attempts % 5 === 0) {
          console.warn(
            `[GPUPixel] Canvas ${canvasId} not found (${attempts}/${maxAttempts}).`,
          );
        }
        if (attempts < maxAttempts) {
          setTimeout(checkCanvas, 200);
        } else {
          console.error(
            "[GPUPixel] FATAL: Canvas " +
              canvasId +
              " not found after retries.",
          );
        }
        return;
      }

      console.log("[GPUPixel] Display canvas found:", canvas);
      self.displayCanvas = canvas;

      // Check if module is already loaded
      if (self.wasmModule && self.moduleLoadPromise) {
        // Module already loaded, just reinitialize
        self._reinitAndStartCamera(canvas);
      } else {
        // Load module first, then start camera
        self
          .loadModule(canvasId)
          .then(function (wasmModule) {
            self._startCameraWithCanvas(canvas);
          })
          .catch(function (error) {
            console.error("[GPUPixel] Failed to load module:", error);
            // Fall back to simple camera without effects
            self._startSimpleCamera(canvas);
          });
      }
    }

    checkCanvas();
  },

  _reinitAndStartCamera: function (canvas) {
    const self = this;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })
      .then(function (stream) {
        self.videoElement = document.createElement("video");
        self.videoElement.playsInline = true;
        self.videoElement.autoplay = true;
        self.videoElement.srcObject = stream;

        self.videoElement.onloadedmetadata = function () {
          self.videoElement.play();

          const width = self.videoElement.videoWidth;
          const height = self.videoElement.videoHeight;

          canvas.width = width;
          canvas.height = height;

          if (self.glCanvas) {
            self.glCanvas.width = width;
            self.glCanvas.height = height;
          }

          self.canvasContext = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          try {
            // Reinitialize GPUPixel
            const initResult = self.wasmModule.ccall(
              "Init",
              "number",
              ["string"],
              ["/gpupixel"],
            );

            if (initResult < 0) {
              console.error("GPUPixel ReInit failed with code:", initResult);
              self.isActive = true;
              self.processLoopSimple(width, height);
              return;
            }

            console.log("GPUPixel ReInit success:", initResult);
            // Apply default beauty params
            self.setBeauty(self.defaultSmoothing, self.defaultWhitening);
            console.log(
              "[GPUPixel] Default beauty applied - Smoothing:",
              self.defaultSmoothing,
              "Whitening:",
              self.defaultWhitening,
            );
            self.isActive = true;
            self.processLoop(width, height);
          } catch (e) {
            console.error("GPUPixel ReInit error:", e);
            self.isActive = true;
            self.processLoopSimple(width, height);
          }
        };
      })
      .catch(function (err) {
        console.error("getUserMedia error:", err);
      });
  },

  _startSimpleCamera: function (canvas) {
    const self = this;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })
      .then(function (stream) {
        self.videoElement = document.createElement("video");
        self.videoElement.playsInline = true;
        self.videoElement.autoplay = true;
        self.videoElement.srcObject = stream;

        self.videoElement.onloadedmetadata = function () {
          self.videoElement.play();
          const width = self.videoElement.videoWidth;
          const height = self.videoElement.videoHeight;
          canvas.width = width;
          canvas.height = height;
          self.canvasContext = canvas.getContext("2d", {
            willReadFrequently: true,
          });
          self.isActive = true;
          self.processLoopSimple(width, height);
          console.log(
            "[GPUPixel] Simple camera mode started (no beauty filter)",
          );
        };
      })
      .catch(function (err) {
        console.error("getUserMedia error:", err);
      });
  },

  _startCameraWithCanvas: function (canvas) {
    const self = this;

    if (!this.wasmModule) {
      console.error("[GPUPixel] WASM module not loaded");
      this._startSimpleCamera(canvas);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })
      .then(function (stream) {
        self.videoElement = document.createElement("video");
        self.videoElement.playsInline = true;
        self.videoElement.autoplay = true;
        self.videoElement.srcObject = stream;

        self.videoElement.onloadedmetadata = function () {
          self.videoElement.play();

          const width = self.videoElement.videoWidth;
          const height = self.videoElement.videoHeight;

          canvas.width = width;
          canvas.height = height;

          // Also resize the WebGL canvas
          if (self.glCanvas) {
            self.glCanvas.width = width;
            self.glCanvas.height = height;
          }

          self.canvasContext = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          try {
            // Initialize GPUPixel with resource path
            const initResult = self.wasmModule.ccall(
              "Init",
              "number",
              ["string"],
              ["/gpupixel"],
            );

            if (initResult < 0) {
              console.error("GPUPixel Init failed with code:", initResult);
              self.isActive = true;
              self.processLoopSimple(width, height);
              return;
            }

            console.log("GPUPixel Init success:", initResult);
            // Apply default beauty params
            self.setBeauty(self.defaultSmoothing, self.defaultWhitening);
            console.log(
              "[GPUPixel] Default beauty applied - Smoothing:",
              self.defaultSmoothing,
              "Whitening:",
              self.defaultWhitening,
            );
            self.isActive = true;
            self.processLoop(width, height);
          } catch (e) {
            console.error("GPUPixel Init error:", e);
            self.isActive = true;
            self.processLoopSimple(width, height);
          }
        };
      })
      .catch(function (err) {
        console.error("getUserMedia error:", err);
      });
  },

  processLoop: function (width, height) {
    if (!this.isActive) return;

    if (this.videoElement && this.videoElement.readyState >= 2) {
      // First draw video to a temporary canvas to get image data
      this.canvasContext.drawImage(this.videoElement, 0, 0, width, height);

      try {
        const imageData = this.canvasContext.getImageData(0, 0, width, height);
        const len = imageData.data.length;

        const ptr = this.wasmModule._malloc(len);
        let memoryView;
        if (this.wasmModule.HEAPU8) {
          memoryView = this.wasmModule.HEAPU8;
        } else if (typeof HEAPU8 !== "undefined") {
          memoryView = HEAPU8;
        } else if (this.wasmModule.buffer) {
          memoryView = new Uint8Array(this.wasmModule.buffer);
        } else if (
          this.wasmModule.wasmMemory &&
          this.wasmModule.wasmMemory.buffer
        ) {
          memoryView = new Uint8Array(this.wasmModule.wasmMemory.buffer);
        }

        if (memoryView) {
          memoryView.set(imageData.data, ptr);
        } else {
          console.error("Cannot find WASM memory");
          this.wasmModule._free(ptr);
          this.processLoopSimple(width, height);
          return;
        }

        // Process image through GPUPixel (renders to gpupixel_canvas via WebGL)
        this.wasmModule._ProcessImage(ptr, width, height);
        this.wasmModule._free(ptr);

        // Copy the processed result from gpupixel_canvas to display canvas
        if (this.glCanvas) {
          this.canvasContext.drawImage(this.glCanvas, 0, 0, width, height);
        }
      } catch (e) {
        console.warn("Process error, falling back to simple mode:", e);
        this.processLoopSimple(width, height);
        return;
      }
    }

    this.requestID = requestAnimationFrame(() =>
      this.processLoop(width, height),
    );
  },

  processLoopSimple: function (width, height) {
    if (!this.isActive) return;

    if (this.videoElement && this.videoElement.readyState >= 2) {
      this.canvasContext.drawImage(this.videoElement, 0, 0, width, height);
    }

    this.requestID = requestAnimationFrame(() =>
      this.processLoopSimple(width, height),
    );
  },

  setBeauty: function (smooth, white) {
    if (this.wasmModule && this.wasmModule._SetBeautyParams) {
      this.wasmModule._SetBeautyParams(smooth, white);
    }
  },

  capture: function (canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      // Pause the camera loop when capturing
      this.pauseCamera();
      return canvas.toDataURL("image/png");
    }
    return null;
  },

  pauseCamera: function () {
    // Stop the processing loop but keep camera resources
    if (this.requestID) {
      cancelAnimationFrame(this.requestID);
      this.requestID = null;
    }
    this.isActive = false;
    console.log("[GPUPixel] Camera paused");
  },

  resumeCamera: function () {
    // Resume the processing loop with existing resources
    if (this.isActive && this.requestID) {
      console.log("[GPUPixel] Camera already active");
      return;
    }

    if (!this.videoElement || !this.canvasContext || !this.displayCanvas) {
      console.error("[GPUPixel] Cannot resume - camera not initialized");
      return;
    }

    const width = this.videoElement.videoWidth || this.displayCanvas.width;
    const height = this.videoElement.videoHeight || this.displayCanvas.height;

    this.isActive = true;

    if (this.wasmModule) {
      this.processLoop(width, height);
    } else {
      this.processLoopSimple(width, height);
    }
    console.log("[GPUPixel] Camera resumed");
  },

  stopCamera: function () {
    console.log("[GPUPixel] Stopping camera and cleaning up...");

    // Stop animation loop
    this.isActive = false;
    if (this.requestID) {
      cancelAnimationFrame(this.requestID);
      this.requestID = null;
    }

    // Stop video stream
    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
    }

    // Destroy WASM resources
    if (this.wasmModule && this.wasmModule._Destroy) {
      try {
        this.wasmModule._Destroy();
      } catch (e) {
        console.warn("Destroy error:", e);
      }
    }

    // Reset references for next session
    this.videoElement = null;
    this.canvasContext = null;
    this.displayCanvas = null;

    console.log("[GPUPixel] Camera stopped and cleaned up");
  },
};
