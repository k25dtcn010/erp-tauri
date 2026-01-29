package com.dell.timekeeping.anticheat;

import android.content.Context;
import android.location.LocationManager;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import org.json.JSONObject;

/**
 * Anti-Cheat Plugin
 * Hệ thống phòng thủ chống gian lận vị trí và thời gian
 */
public class AntiCheatPlugin {
    
    private Context context;
    
    // Lưu trạng thái Mock Location
    private static boolean isMockLocation = false;
    
    public static void setMockLocationDetected(boolean detected) {
        isMockLocation = detected;
    }
    
    // Remote config flag
    private static boolean remoteConfigEnabled = true;
    
    // Kiểm tra kết hợp các điều kiện
    private static boolean isLocationCheckBypassed = false;
    
    private SecureLocationClient locationClient;
    private TimeReliabilityManager timeReliabilityManager;
    private SecureLocationClient.LocationUpdateListener locationListener;

    private static AntiCheatPlugin instance;

    public static synchronized AntiCheatPlugin getInstance(Context context) {
        if (instance == null) {
            instance = new AntiCheatPlugin(context.getApplicationContext());
        }
        return instance;
    }

    public AntiCheatPlugin(Context context) {
        this.context = context;
    }
    
    public void setLocationListener(SecureLocationClient.LocationUpdateListener listener) {
        this.locationListener = listener;
    }

    public void initialize() {
        locationClient = new SecureLocationClient(context, locationListener);
        timeReliabilityManager = new TimeReliabilityManager(context);
        timeReliabilityManager.initializeAndCheck();
    }
    
    public void startLocationUpdates() {
        if (locationClient != null) {
            locationClient.startLocationUpdates();
        }
    }
    
    public void stopLocationUpdates() {
        if (locationClient != null) {
            locationClient.stopLocationUpdates();
        }
    }
    
    public boolean isMockLocationEnabled() {
        return isMockLocation;
    }
    
    public void setRemoteConfigEnabled(boolean enabled) {
        remoteConfigEnabled = enabled;
    }
    
    public static boolean isLocationCheckActive() {
        return remoteConfigEnabled && !isLocationCheckBypassed;
    }
    
    public Map<String, Object> getSecureLocation() {
        if (locationClient != null) {
            return locationClient.getLastKnownLocation();
        }
        return null;
    }
    
    public Map<String, Object> updateWithRealTime(long realTime, String source) {
         if (timeReliabilityManager != null) {
            return timeReliabilityManager.updateWithRealTime(realTime, source);
         }
         return new HashMap<>();
    }
    
    public Map<String, Object> getTelemetryData() {
        if (timeReliabilityManager != null) {
            return timeReliabilityManager.getTelemetryData();
        }
        return new HashMap<>();
    }

    public Map<String, Object> checkTimeReliability() {
        if (timeReliabilityManager != null) {
            return timeReliabilityManager.checkTimeCheating();
        }
        return new HashMap<>();
    }

    /**
     * LAYER 1: Kiểm tra thiết bị đã Root chưa
     */
    public Map<String, Object> checkRootStatus() {
        Map<String, Object> resultMap = new HashMap<>();
        
        boolean isRooted = false;
        String rootMethod = "";
        
        // Kiểm tra file su tồn tại
        File suBin = new File("/system/bin/su");
        File suXbin = new File("/system/xbin/su");
        
        if (suBin.exists() && hasExecutePermission("/system/bin/su")) {
            isRooted = true;
            rootMethod = "/system/bin/su";
        } else if (suXbin.exists() && hasExecutePermission("/system/xbin/su")) {
            isRooted = true;
            rootMethod = "/system/xbin/su";
        }
        
        // Kiểm tra thêm các đường dẫn phổ biến khác
        String[] rootPaths = {
            "/sbin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/data/local/su"
        };
        
        if (!isRooted) {
        for (String path : rootPaths) {
            if (new File(path).exists()) {
                isRooted = true;
                rootMethod = path;
                break;
                }
            }
        }
        
        resultMap.put("isRooted", isRooted);
        resultMap.put("rootMethod", rootMethod);
        
        resultMap.put("deviceModel", Build.MODEL);
        resultMap.put("manufacturer", Build.MANUFACTURER);
        resultMap.put("brand", Build.BRAND);
        resultMap.put("device", Build.DEVICE);
        resultMap.put("product", Build.PRODUCT);
        resultMap.put("sdkVersion", Build.VERSION.SDK_INT);
        resultMap.put("release", Build.VERSION.RELEASE);
        resultMap.put("fingerprint", Build.FINGERPRINT);
        
        return resultMap;
    }
    
    public Map<String, Object> getTimezoneInfo() {
        Map<String, Object> info = new HashMap<>();
        
        TimeZone tz = TimeZone.getDefault();
        info.put("id", tz.getID());
        info.put("displayName", tz.getDisplayName(false, TimeZone.SHORT).trim());
        info.put("displayNameLong", tz.getDisplayName(false, TimeZone.LONG));
        info.put("rawOffset", tz.getRawOffset());
        info.put("dstSavings", tz.getDSTSavings());
        info.put("useDaylightTime", tz.useDaylightTime());
        info.put("inDaylightTime", tz.inDaylightTime(new java.util.Date()));
        
        return info;
    }
    
    public void reportTimeAnomaly(String localTime, String systemTime, String source) {
        Log.w("AntiCheat", 
            "Time anomaly detected - Local: " + localTime + 
            ", System: " + systemTime + 
            ", Source: " + source);
    }
    
    private boolean hasExecutePermission(String path) {
        try {
            Process process = Runtime.getRuntime().exec("ls -l " + path);
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            String line = reader.readLine();
            reader.close();
            process.destroy();
            
            if (line != null && line.length() >= 4) {
                char permission = line.charAt(3);
                return permission == 's' || permission == 'x';
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public Map<String, Object> checkMockLocationFromCoords(double lat, double lng) {
        Map<String, Object> resultMap = new HashMap<>();
        
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        
        boolean gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        boolean networkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        
        resultMap.put("gpsEnabled", gpsEnabled);
        resultMap.put("networkEnabled", networkEnabled);
        resultMap.put("isMockLocation", isMockLocation);
        resultMap.put("latitude", lat);
        resultMap.put("longitude", lng);
        
        return resultMap;
    }
    
    // JSON Helpers for JNI
    public String getSecureLocationJson() {
        Map<String, Object> map = getSecureLocation();
        if (map == null) return "{}";
        return new JSONObject(map).toString();
    }

    public String checkTimeReliabilityJson() {
        Map<String, Object> map = checkTimeReliability();
        return new JSONObject(map).toString();
    }

    public String getTelemetryDataJson() {
        Map<String, Object> map = getTelemetryData();
        return new JSONObject(map).toString();
    }
    
    public String checkRootStatusJson() {
        Map<String, Object> map = checkRootStatus();
        return new JSONObject(map).toString();
    }

    public Map<String, Object> getDeviceSecurityInfo() {
        Map<String, Object> info = new HashMap<>();
        
        info.put("deviceModel", Build.MODEL);
        info.put("manufacturer", Build.MANUFACTURER);
        info.put("sdkVersion", Build.VERSION.SDK_INT);
        info.put("bootId", getBootId());
        info.put("bootCount", getBootCount());
        info.put("elapsedRealtime", SystemClock.elapsedRealtime());
        info.put("systemTime", System.currentTimeMillis());
        
        return info;
    }
    
    private String getBootId() {
        try {
            BufferedReader reader = new BufferedReader(
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
}
