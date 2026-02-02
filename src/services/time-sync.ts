/**
 * Time Synchronization Service
 *
 * Đảm bảo timestamp chính xác bằng cách sync với server,
 * ngăn chặn việc user thay đổi giờ hệ thống để gian lận chấm công.
 */

interface TimeSyncData {
  serverTime: number;        // Server timestamp (ms) tại thời điểm sync
  clientTime: number;        // Client timestamp khi nhận response
  offset: number;            // Chênh lệch: serverTime - clientTime
  lastSyncAt: number;        // Thời điểm sync cuối (client time)
  rtt: number;              // Round Trip Time (ms) - độ trễ mạng
}

const STORAGE_KEY = 'time_sync_data';
const SYNC_INTERVAL = 5 * 60 * 1000; // Sync lại mỗi 5 phút
const MAX_DRIFT_ALLOWED = 30 * 1000; // Cho phép lệch tối đa 30 giây
const SYNC_TIMEOUT = 10 * 1000; // Timeout cho request sync: 10s

export class TimeSyncService {
  private static syncData: TimeSyncData | null = null;
  private static syncing = false;

  /**
   * Lấy thời gian từ WorldTimeAPI (public API)
   * Sử dụng timezone Asia/Bangkok
   * Fallback: timeapi.io nếu primary endpoint fail
   */
  private static async fetchServerTime(): Promise<number> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT);

    try {
      // Primary: Bangkok timezone
      const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Bangkok', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`WorldTimeAPI responded with ${response.status}`);
      }

      const data = await response.json();

      // WorldTimeAPI trả về unixtime (seconds), cần convert sang milliseconds
      if (data.unixtime) {
        return Number(data.unixtime) * 1000;
      } else if (data.datetime) {
        return new Date(data.datetime).getTime();
      } else {
        throw new Error('Invalid response format from WorldTimeAPI');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Fallback: Try timeapi.io
      if (error.name !== 'AbortError') {
        try {
          console.warn('[TimeSync] Primary endpoint failed, trying fallback timeapi.io');
          const fallbackController = new AbortController();
          const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), SYNC_TIMEOUT);

          const fallbackResponse = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Bangkok', {
            method: 'GET',
            signal: fallbackController.signal,
          });

          clearTimeout(fallbackTimeoutId);

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            // timeapi.io returns dateTime in ISO format and individual fields
            if (fallbackData.dateTime) {
              return new Date(fallbackData.dateTime).getTime();
            } else if (fallbackData.year && fallbackData.month && fallbackData.day) {
              // Construct from individual fields if dateTime not available
              const dateStr = `${fallbackData.year}-${String(fallbackData.month).padStart(2, '0')}-${String(fallbackData.day).padStart(2, '0')}T${String(fallbackData.hour).padStart(2, '0')}:${String(fallbackData.minute).padStart(2, '0')}:${String(fallbackData.seconds).padStart(2, '0')}.${String(fallbackData.milliSeconds || 0).padStart(3, '0')}`;
              return new Date(dateStr).getTime();
            }
          }
        } catch (fallbackError) {
          console.error('[TimeSync] Fallback also failed:', fallbackError);
        }
      }

      // If all failed
      if (error.name === 'AbortError') {
        throw new Error('Timeout khi kết nối WorldTimeAPI. Vui lòng thử lại.');
      }
      throw new Error('Không thể lấy thời gian từ internet. Vui lòng kiểm tra kết nối mạng.');
    }
  }

  /**
   * Sync thời gian với server
   * Tính toán offset giữa client và server để điều chỉnh timestamp
   */
  static async syncTime(): Promise<boolean> {
    // Prevent concurrent syncs
    if (this.syncing) {
      console.log('[TimeSync] ⏳ Sync already in progress, skipping...');
      return false;
    }

    this.syncing = true;

    try {
      const clientBeforeRequest = Date.now();
      const serverTime = await this.fetchServerTime();
      const clientAfterRequest = Date.now();

      // Tính RTT (Round Trip Time) và lấy thời điểm giữa
      const rtt = clientAfterRequest - clientBeforeRequest;
      const estimatedClientTime = clientBeforeRequest + rtt / 2;
      const offset = serverTime - estimatedClientTime;

      this.syncData = {
        serverTime,
        clientTime: estimatedClientTime,
        offset,
        lastSyncAt: clientAfterRequest,
        rtt,
      };

      // Lưu vào storage để persist across sessions
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.syncData));
      } catch (e) {
        console.warn('[TimeSync] Failed to save to localStorage:', e);
      }

      console.log(`[TimeSync] ✅ Synced successfully`);
      console.log(`  - Server Time: ${new Date(serverTime).toISOString()}`);
      console.log(`  - Client Time: ${new Date(estimatedClientTime).toISOString()}`);
      console.log(`  - Offset: ${offset}ms`);
      console.log(`  - RTT: ${rtt}ms`);

      return true;
    } catch (error: any) {
      console.error('[TimeSync] ❌ Sync failed:', error.message);
      return false;
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Sync chỉ khi cần thiết (> 5 phút từ lần sync cuối)
   * Dùng method này để tránh gọi API không cần thiết khi reload page
   */
  static async syncTimeIfNeeded(): Promise<boolean> {
    // Load sync data từ localStorage nếu chưa có
    this.loadSyncData();

    // Kiểm tra xem có cần sync không
    if (!this.needsSync()) {
      const timeSinceLastSync = this.syncData ? Date.now() - this.syncData.lastSyncAt : 0;
      console.log(`[TimeSync] ⏭️ Skip sync (last synced ${Math.floor(timeSinceLastSync / 1000)}s ago)`);
      return true; // Trả về true vì đã có data hợp lệ
    }

    // Cần sync → gọi API
    return await this.syncTime();
  }

  /**
   * Load sync data từ localStorage nếu có
   */
  private static loadSyncData(): void {
    if (this.syncData) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.syncData = JSON.parse(stored);
        console.log('[TimeSync] 📂 Loaded sync data from storage');
      }
    } catch (e) {
      console.warn('[TimeSync] Failed to load from localStorage:', e);
    }
  }

  /**
   * Kiểm tra xem có cần sync lại không
   * Chỉ sync khi đã quá 5 phút (kể cả khi clock went backwards)
   */
  private static needsSync(): boolean {
    if (!this.syncData) return true;

    const timeSinceLastSync = Date.now() - this.syncData.lastSyncAt;

    // Dùng Math.abs để xử lý cả trường hợp clock went backwards
    // Chỉ sync khi khoảng cách thời gian (dương hoặc âm) > 5 phút
    const absTimeDiff = Math.abs(timeSinceLastSync);

    if (absTimeDiff > SYNC_INTERVAL) {
      if (timeSinceLastSync < 0) {
        console.warn('[TimeSync] ⚠️ System clock went backwards! Need re-sync (>5min).');
      } else {
        console.log('[TimeSync] ⏰ Sync interval expired, need re-sync');
      }
      return true;
    }

    return false;
  }

  /**
   * Lấy thời gian hiện tại đã được điều chỉnh theo server
   * MAIN METHOD - Dùng method này thay cho Date.now()
   *
   * Fallback behavior: Nếu sync fail, vẫn trả về timestamp (dùng cached offset hoặc client time)
   * để không block luồng chấm công
   */
  static async getReliableTimestamp(): Promise<number> {
    // 1. Load sync data nếu chưa có
    this.loadSyncData();

    // 2. Sync lại nếu cần
    if (this.needsSync()) {
      const synced = await this.syncTime();
      if (!synced) {
        console.warn('[TimeSync] ⚠️ Sync failed, using fallback timestamp (cached offset or client time)');
        // KHÔNG throw error - fallback về client time với cached offset (nếu có)
      }
    }

    // 3. Tính toán thời gian thực dựa trên offset
    const clientNow = Date.now();
    const estimatedServerTime = clientNow + (this.syncData?.offset || 0);

    return estimatedServerTime;
  }

  /**
   * Kiểm tra kết nối và sync
   * Dùng trước khi chấm công để đảm bảo có mạng
   *
   * Fallback behavior: Không throw error, trả về false nếu offline/sync fail
   * để không block luồng chấm công
   */
  static async checkOnlineAndSync(): Promise<boolean> {
    if (!navigator.onLine) {
      console.warn('[TimeSync] ⚠️ Offline, skipping sync (will use cached offset or client time)');
      return false; // KHÔNG throw - cho phép chấm công với cached data
    }

    return await this.syncTime();
  }

  /**
   * Validate timestamp có hợp lý không
   * Kiểm tra xem timestamp có lệch quá xa so với hiện tại
   */
  static validateTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const drift = Math.abs(timestamp - now);

    if (drift > MAX_DRIFT_ALLOWED) {
      console.warn(`[TimeSync] ⚠️ Timestamp drift detected: ${drift}ms`);
      return false;
    }

    return true;
  }

  /**
   * Phát hiện time manipulation (user chỉnh giờ)
   */
  static detectTimeManipulation(): boolean {
    this.loadSyncData();

    if (!this.syncData) return false;

    const clientNow = Date.now();
    const expectedMinTime = this.syncData.lastSyncAt;

    // Nếu client time nhỏ hơn lần sync cuối = đã chỉnh giờ lùi
    if (clientNow < expectedMinTime) {
      console.error('[TimeSync] 🚨 Time manipulation detected! Clock went backwards.');
      return true;
    }

    // Kiểm tra offset có thay đổi đột ngột không
    const estimatedServerTime = clientNow + this.syncData.offset;
    const drift = Math.abs(estimatedServerTime - Date.now());

    if (drift > MAX_DRIFT_ALLOWED * 2) {
      console.error('[TimeSync] 🚨 Suspicious time drift detected:', drift, 'ms');
      return true;
    }

    return false;
  }

  /**
   * Get thông tin sync hiện tại (for debugging)
   */
  static getSyncInfo(): TimeSyncData | null {
    this.loadSyncData();
    return this.syncData;
  }

  /**
   * Clear sync data (for testing)
   */
  static clearSyncData(): void {
    this.syncData = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[TimeSync] Failed to clear localStorage:', e);
    }
  }

  /**
   * Lấy offset hiện tại
   */
  static getOffset(): number {
    this.loadSyncData();
    return this.syncData?.offset || 0;
  }
}
