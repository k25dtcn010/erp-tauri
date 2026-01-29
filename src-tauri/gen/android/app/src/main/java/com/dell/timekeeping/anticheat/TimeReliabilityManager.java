package com.dell.timekeeping.anticheat;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;

import java.util.HashMap;
import java.util.Map;

/**
 * Quản lý độ tin cậy thời gian - Chống gian lận giờ chấm công
 * Logic từ file y0.java (TimeReliabilityUtils)
 */
public class TimeReliabilityManager {
    
    private static final String TAG = "TimeReliability";
    private static final String PREF_NAME = "time_reliability";
    private static final String KEY_RELIABILITY_VALUE = "reliability_value";
    private static final String KEY_LAST_BOOT_ID = "last_boot_id";
    private static final String KEY_LAST_BOOT_COUNT = "last_boot_count";
    private static final String KEY_LAST_LEGAL_TIME = "last_legal_time";
    private static final String KEY_NETWORK_REAL_TIME = "network_real_time";
    
    // Additional keys mentioned in original but missing in constants
    // private static final String KEY_REBOOT_STATUS = "reboot_status";
    // private static final String KEY_CLEAR_STATUS = "clear_status";
    
    private Context context;
    private SharedPreferences prefs;
    
    // Trạng thái hiện tại
    private int reliabilityValue = 100;
    private boolean isRebooted = false;
    private boolean isCleared = false;
    private boolean isAutoTimeOff = false;
    private boolean isAutoTimeZoneOff = false;
    private long lastLegalTime = 0;
    private long networkRealTime = 0;
    private String lastBootId = "";
    private int lastBootCount = 0;
    private int rebootStatus = 0;   // 0 = chưa xử lý, 1 = đã trừ điểm
    private int clearStatus = 0;    // 0 = chưa xử lý, 1 = đã trừ điểm
    
    // Ngưỡng cho việc đánh giá
    private static final int REBOOT_PENALTY = 15;
    private static final int CLEAR_PENALTY = 15;
    private static final long TIME_SKEW_THRESHOLD_MS = 60000; // 60 giây
    
    public TimeReliabilityManager(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        loadFromPrefs();
    }
    
    /**
     * Khởi tạo và kiểm tra độ tin cậy khi app start
     */
    public Map<String, Object> initializeAndCheck() {
        Map<String, Object> result = new HashMap<>();
        
        String currentBootId = getBootId();
        int currentBootCount = getBootCount();
        long currentTime = System.currentTimeMillis();
        long elapsedRealtime = SystemClock.elapsedRealtime();
        boolean isNetworkConnected = isNetworkAvailable();
        int autoTimeSwitch = getAutoTimeSetting();
        int autoTimeZoneSwitch = getAutoTimeZoneSetting();
        
        // Lưu các static flags
        isAutoTimeOff = autoTimeSwitch <= 0;
        isAutoTimeZoneOff = autoTimeZoneSwitch <= 0;
        
        // Logic khởi tạo lần đầu
        if (lastLegalTime == 0 && networkRealTime == 0) {
            // Lần đầu hoặc data bị xóa
            if (!isNetworkConnected) {
                reliabilityValue = 85; // Không có mạng, bắt đầu 85 điểm
            } else {
                reliabilityValue = 100; // Có mạng, 100 điểm
            }
            isCleared = true;
            clearStatus = 0;
            Log.d(TAG, "First init or data cleared. Score: " + reliabilityValue);
        }
        
        // Kiểm tra reboot
        if (hasRebootOccurred(currentBootId, currentBootCount)) {
            isRebooted = true;
            if (rebootStatus == 0) {
                reliabilityValue -= REBOOT_PENALTY;
                rebootStatus = 1;
                Log.d(TAG, "Device rebooted detected. Penalty applied. Score: " + reliabilityValue);
            }
        }
        
        // Kiểm tra clear data
        if (isFirstLaunchAfterClear()) {
            isCleared = true;
            if (clearStatus == 0) {
                reliabilityValue -= CLEAR_PENALTY;
                clearStatus = 1;
                Log.d(TAG, "App data cleared detected. Penalty applied. Score: " + reliabilityValue);
            }
        }
        
        // Đảm bảo điểm không âm
        reliabilityValue = Math.max(0, reliabilityValue);
        
        // Lưu trạng thái mới
        lastBootId = currentBootId;
        lastBootCount = currentBootCount;
        saveToPrefs();
        
        // Trả về kết quả
        result.put("reliabilityValue", reliabilityValue);
        result.put("isRebooted", isRebooted);
        result.put("isCleared", isCleared);
        result.put("rebootStatus", rebootStatus);
        result.put("clearStatus", clearStatus);
        result.put("bootId", currentBootId);
        result.put("bootCount", currentBootCount);
        result.put("systemTime", currentTime);
        result.put("elapsedRealtime", elapsedRealtime);
        result.put("bootStartTime", currentTime - elapsedRealtime);
        result.put("lastLegalTime", lastLegalTime);
        result.put("networkRealTime", networkRealTime);
        result.put("isNetworkConnected", isNetworkConnected);
        result.put("autoTimeSwitch", autoTimeSwitch);
        result.put("autoTimeZoneSwitch", autoTimeZoneSwitch);
        result.put("isAutoTimeOff", isAutoTimeOff);
        result.put("isAutoTimeZoneOff", isAutoTimeZoneOff);
        
        return result;
    }
    
    private boolean hasRebootOccurred(String currentBootId, int currentBootCount) {
        if (currentBootCount > 0 && lastBootCount > 0) {
            return currentBootCount != lastBootCount;
        } else if (!currentBootId.isEmpty() && !lastBootId.isEmpty()) {
            return !currentBootId.equals(lastBootId);
        }
        return false;
    }
    
    private boolean isFirstLaunchAfterClear() {
        return !prefs.contains(KEY_RELIABILITY_VALUE);
    }
    
    private boolean isNetworkAvailable() {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
                context.getSystemService(Context.CONNECTIVITY_SERVICE);
            android.net.NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        } catch (Exception e) {
            return false;
        }
    }
    
    public Map<String, Object> updateWithRealTime(long realTime, String source) {
        Map<String, Object> result = new HashMap<>();
        
        networkRealTime = realTime;
        
        // Nếu trước đó đã bị reboot hoặc cleared, nhưng bây giờ có thời gian thực
        // thì phục hồi điểm
        if (isRebooted) {
            reliabilityValue += REBOOT_PENALTY;
            isRebooted = false;
        }
        
        if (isCleared) {
            lastLegalTime = realTime;
            reliabilityValue += CLEAR_PENALTY;
            isCleared = false;
        }
        
        reliabilityValue = Math.min(100, reliabilityValue);
        
        lastBootId = getBootId();
        lastBootCount = getBootCount();
        
        saveToPrefs();
        
        result.put("reliabilityValue", reliabilityValue);
        result.put("isRebooted", isRebooted);
        result.put("isCleared", isCleared);
        result.put("source", source);
        result.put("networkRealTime", networkRealTime);
        result.put("lastLegalTime", lastLegalTime);
        
        return result;
    }
    
    public Map<String, Object> checkTimeCheating() {
        Map<String, Object> result = new HashMap<>();
        
        long systemTime = System.currentTimeMillis();
        long elapsedRealtime = SystemClock.elapsedRealtime();
        long bootStartTime = systemTime - elapsedRealtime;
        long bootCorrectTime = bootStartTime + elapsedRealtime;
        
        int autoTime = getAutoTimeSetting();
        int autoTimeZone = getAutoTimeZoneSetting();
        
        isAutoTimeOff = autoTime <= 0;
        isAutoTimeZoneOff = autoTimeZone <= 0;
        
        long timeSkew = 0;
        if (networkRealTime > 0) {
            timeSkew = Math.abs(systemTime - networkRealTime);
        }
        
        boolean scoreCondition = reliabilityValue > 90;
        boolean rebootClearCondition = isCleared || isRebooted;
        boolean autoTimeCondition = isAutoTimeOff || isAutoTimeZoneOff;
        boolean skewCondition = timeSkew <= TIME_SKEW_THRESHOLD_MS;
        
        boolean isNotCheating = (scoreCondition || !(rebootClearCondition && autoTimeCondition)) && skewCondition;
        boolean isCheatingTime = !isNotCheating;
        
        String cheatingReason = "";
        if (isCheatingTime) {
            if (timeSkew > TIME_SKEW_THRESHOLD_MS) {
                cheatingReason = "Time skew exceeds threshold: " + timeSkew + "ms > " + TIME_SKEW_THRESHOLD_MS + "ms";
            } else if (rebootClearCondition && autoTimeCondition && reliabilityValue <= 90) {
                cheatingReason = "Suspicious: (rebooted=" + isRebooted + "/cleared=" + isCleared + 
                                ") + (autoTimeOff=" + isAutoTimeOff + "/autoTimeZoneOff=" + isAutoTimeZoneOff + 
                                ") + score=" + reliabilityValue;
            }
        }
        
        result.put("isCheatingTime", isCheatingTime);
        result.put("cheatingReason", cheatingReason);
        result.put("reliabilityValue", reliabilityValue);
        result.put("systemTime", systemTime);
        result.put("elapsedRealtime", elapsedRealtime);
        result.put("bootStartTime", bootStartTime);
        result.put("bootCorrectTime", bootCorrectTime);
        result.put("networkRealTime", networkRealTime);
        result.put("timeSkew", timeSkew);
        result.put("autoTimeSwitch", autoTime);
        result.put("autoTimeZoneSwitch", autoTimeZone);
        result.put("isAutoTimeOff", isAutoTimeOff);
        result.put("isAutoTimeZoneOff", isAutoTimeZoneOff);
        result.put("autoTimeEnabled", autoTime > 0);
        result.put("autoTimeZoneEnabled", autoTimeZone > 0);
        result.put("isRebooted", isRebooted);
        result.put("isCleared", isCleared);
        result.put("rebootStatus", rebootStatus);
        result.put("clearStatus", clearStatus);
        
        Log.d(TAG, "checkTimeCheating: score=" + reliabilityValue + 
              ", cleared=" + isCleared + ", rebooted=" + isRebooted +
              ", autoTimeOff=" + isAutoTimeOff + ", autoTimeZoneOff=" + isAutoTimeZoneOff +
              ", skew=" + timeSkew + ", result=" + isCheatingTime);
        
        return result;
    }
    
    public Map<String, Object> getTelemetryData() {
        Map<String, Object> data = new HashMap<>();
        
        long systemTime = System.currentTimeMillis();
        long elapsedRealtime = SystemClock.elapsedRealtime();
        long bootStartTime = systemTime - elapsedRealtime;
        
        data.put("bootId", getBootId());
        data.put("lastBootId", lastBootId);
        data.put("bootCount", getBootCount());
        data.put("lastBootCount", lastBootCount);
        data.put("autoTimeSwitch", getAutoTimeSetting());
        data.put("autoTimeZoneSwitch", getAutoTimeZoneSetting());
        data.put("elapsedRealtime", elapsedRealtime);
        data.put("bootStartTime", bootStartTime);
        data.put("systemTime", systemTime);
        data.put("networkRealTime", networkRealTime);
        data.put("lastLegalTime", lastLegalTime);
        data.put("timeReliabilityValue", reliabilityValue);
        data.put("isRebooted", isRebooted);
        data.put("isCleared", isCleared);
        data.put("calculateTime", bootStartTime + elapsedRealtime);
        data.put("subOfSystemTimeAndCorrectTime", systemTime - bootStartTime - elapsedRealtime);
        
        data.put("timeZone", java.util.TimeZone.getDefault().getID());
        data.put("timeZoneOffset", java.util.TimeZone.getDefault().getRawOffset());
        
        return data;
    }
    
    private String getBootId() {
        try {
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.FileReader("/proc/sys/kernel/random/boot_id")
            );
            String bootId = reader.readLine();
            reader.close();
            return bootId != null ? bootId.trim() : "";
        } catch (Exception e) {
            return "";
        }
    }
    
    private int getBootCount() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                return android.provider.Settings.Global.getInt(
                    context.getContentResolver(),
                    android.provider.Settings.Global.BOOT_COUNT
                );
            } catch (Exception e) {
                return -1;
            }
        }
        return -1;
    }
    
    private int getAutoTimeSetting() {
        try {
            return android.provider.Settings.Global.getInt(
                context.getContentResolver(),
                android.provider.Settings.Global.AUTO_TIME
            );
        } catch (Exception e) {
            return -1;
        }
    }
    
    private int getAutoTimeZoneSetting() {
        try {
            return android.provider.Settings.Global.getInt(
                context.getContentResolver(),
                android.provider.Settings.Global.AUTO_TIME_ZONE
            );
        } catch (Exception e) {
            return -1;
        }
    }
    
    private void loadFromPrefs() {
        reliabilityValue = prefs.getInt(KEY_RELIABILITY_VALUE, 100);
        lastBootId = prefs.getString(KEY_LAST_BOOT_ID, "");
        lastBootCount = prefs.getInt(KEY_LAST_BOOT_COUNT, 0);
        lastLegalTime = prefs.getLong(KEY_LAST_LEGAL_TIME, 0);
        networkRealTime = prefs.getLong(KEY_NETWORK_REAL_TIME, 0);
    }
    
    private void saveToPrefs() {
        prefs.edit()
            .putInt(KEY_RELIABILITY_VALUE, reliabilityValue)
            .putString(KEY_LAST_BOOT_ID, lastBootId)
            .putInt(KEY_LAST_BOOT_COUNT, lastBootCount)
            .putLong(KEY_LAST_LEGAL_TIME, lastLegalTime)
            .putLong(KEY_NETWORK_REAL_TIME, networkRealTime)
            .apply();
    }
    
    public int getReliabilityValue() { return reliabilityValue; }
    public boolean isRebooted() { return isRebooted; }
    public boolean isCleared() { return isCleared; }
}
