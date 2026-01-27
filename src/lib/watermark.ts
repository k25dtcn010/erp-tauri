// --- TYPES ---
export interface WatermarkOptions {
  employeeCode: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  timestamp?: Date;
}

// --- HELPER: Load Image ---
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Quan trọng để tránh lỗi Tainted Canvas
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// --- HELPER: Capitalize First Letter ---
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const WatermarkService = {
  /**
   * Lấy địa chỉ từ tọa độ (Reverse Geocoding via OSM)
   */
  async getAddressFromCoordinates(
    lat: number,
    lon: number,
  ): Promise<string | null> {
    try {
      // Dùng fetch native cho nhẹ, không cần cài axios/dio
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Zalo-Mini-App/1.0",
          },
        },
      );

      if (!response.ok) return null;
      const data = await response.json();
      return this._extractAddressFromOSM(data);
    } catch (e) {
      console.warn("Error getting address:", e);
      return null;
    }
  },

  /**
   * Logic parse địa chỉ giống hệt bản Flutter
   */
  _extractAddressFromOSM(osmResponse: any): string | null {
    try {
      const address = osmResponse.address || {};
      const parts: string[] = [];

      // 1. Số nhà + Đường
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
      } else if (address.road) {
        parts.push(address.road);
      }

      // 2. Phường/Xã/Thôn
      if (address.suburb) parts.push(address.suburb);
      else if (address.village) parts.push(address.village);
      else if (address.quarter) parts.push(address.quarter);

      // 3. Quận/Huyện (Xử lý regex xóa prefix)
      if (address.city_district) {
        let district = address.city_district;
        if (district.toLowerCase().includes("quận")) {
          parts.push("Q. " + district.replace(/^[Qq]uận\s*/, ""));
        } else if (district.toLowerCase().includes("huyện")) {
          parts.push("H. " + district.replace(/^[Hh]uyện\s*/, ""));
        } else {
          parts.push(district);
        }
      } else if (address.district) {
        parts.push(address.district);
      }

      // 4. Tỉnh/Thành phố
      if (address.city) {
        let city = address.city;
        if (city.toLowerCase().includes("thành phố")) {
          parts.push(city);
        } else {
          parts.push("TP. " + city);
        }
      } else if (address.state) {
        parts.push(address.state);
      }

      return parts.length > 0 ? parts.join(", ") : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Hàm chính: Vẽ Watermark lên ảnh
   * @param imageSource Base64 string hoặc Blob URL
   * @param options Thông tin watermark
   * @returns Promise<string> (Base64 của ảnh đã watermark)
   */
  async addWatermark(
    imageSource: string,
    options: WatermarkOptions,
  ): Promise<string> {
    // 1. Load ảnh gốc
    const originalImage = await loadImage(imageSource);
    const originalWidth = originalImage.width;
    const originalHeight = originalImage.height;

    // 2. Logic Resize (Giống Node.js/Flutter)
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth >= 1000) {
      targetWidth = 1280;
      targetHeight = Math.round((targetWidth * originalHeight) / originalWidth);
    }

    // 3. Tạo Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Cannot create canvas context");

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 4. Vẽ ảnh nền
    ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

    // 5. Tính toán kích thước (Scale Logic)
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

    // 6. Chuẩn bị nội dung Text
    const dateObj = options.timestamp || new Date();

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

    // Weekday: Thứ Hai (Viết hoa chữ đầu)
    const weekdayRaw = dateObj.toLocaleDateString("vi-VN", { weekday: "long" });
    const weekdayLine = capitalizeFirstLetter(weekdayRaw);

    const codeStr = options.employeeCode;

    let locationStr = "";
    if (options.address) {
      locationStr = options.address;
    } else if (options.latitude && options.longitude) {
      locationStr = `${options.latitude.toFixed(6)}, ${options.longitude.toFixed(6)}`;
    }

    // 7. Vẽ Shadow (Gradient)
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

    // 8. Cấu hình Font chung
    const fontFamily = "Roboto, Arial, sans-serif";
    ctx.textBaseline = "alphabetic"; // Quan trọng: Để giống logic baseline của Flutter
    ctx.fillStyle = "white";

    // --- BẮT ĐẦU VẼ TỪ DƯỚI LÊN ---

    // Vị trí Y khởi điểm (Baseline của dòng dưới cùng)
    let currentBaselineY = targetHeight - padding;

    // A. Vẽ Location
    if (locationStr) {
      ctx.font = `${fsCoords}px ${fontFamily}`;
      ctx.fillStyle = "#DDDDDD";
      ctx.fillText(locationStr, padding, currentBaselineY);

      currentBaselineY -= fsCoords + lineGap;
    }

    // B. Vẽ Employee Code
    ctx.font = `${fsCode}px ${fontFamily}`;
    ctx.fillStyle = "white";
    ctx.fillText(codeStr, padding, currentBaselineY);

    // C. Tính toán khối Time Block
    // Baseline của Time text
    const yTimeBlockOrigin = currentBaselineY - fsCode - blockGap;

    // D. Vẽ Giờ (Time)
    ctx.font = `bold ${fsTime}px ${fontFamily}`; // Bold
    ctx.fillText(timeStr, padding, yTimeBlockOrigin);

    // E. Vẽ Thanh Vàng (Bar)
    // Tính width của text giờ để xác định vị trí thanh vàng
    // const timeMetrics = ctx.measureText(timeStr);
    // const xBar = padding + timeMetrics.width + barGap;
    // -> Logic Flutter dùng công thức ước lượng, ta giữ nguyên để khớp:
    const estimatedTimeW = fsTime * 0.55 * 5;
    const xBar = padding + estimatedTimeW + barGap;

    // Trong HTML Canvas, tọa độ Y vẽ rect tính từ góc trên-trái
    // Logic Flutter: y = baseline - (fsTime * 0.72)
    const barTopY = yTimeBlockOrigin - fsTime * 0.72;
    const barHeight = fsTime * 0.75;

    ctx.fillStyle = "#FFC107"; // Amber/Yellow
    ctx.fillRect(xBar, barTopY, barWidth, barHeight);

    // F. Vẽ Ngày & Thứ
    const xDate = xBar + barWidth + barGap;
    ctx.fillStyle = "white";

    // Date Line (Dòng trên)
    const yDateLineBaseline = yTimeBlockOrigin - fsTime * 0.42;
    ctx.font = `${fsDate}px ${fontFamily}`;
    ctx.fillText(dateLine, xDate, yDateLineBaseline);

    // Weekday (Dòng dưới) - Cùng baseline với Time
    ctx.fillText(weekdayLine, xDate, yTimeBlockOrigin);

    // 9. Xuất ảnh
    // Trả về Base64 JPEG (Quality 0.85 để tối ưu dung lượng)
    return canvas.toDataURL("image/jpeg", 0.85);
  },
};
