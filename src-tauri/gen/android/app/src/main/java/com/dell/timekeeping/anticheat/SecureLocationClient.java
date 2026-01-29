package com.dell.timekeeping.anticheat;

import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Looper;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.Map;

/**
 * Location Client với tính năng Anti-Fake GPS
 */
public class SecureLocationClient implements LocationListener {
    
    private static final String TAG = "SecureLocationClient";
    
    public interface LocationUpdateListener {
        void onLocationUpdate(Map<String, Object> locationData);
        void onProviderChanged(String provider, boolean enabled);
    }

    private Context context;
    private LocationManager locationManager;
    private LocationUpdateListener listener;
    
    // Cấu hình
    private static final long MIN_TIME_MS = 5000; // 5 giây - interval
    private static final float MIN_DISTANCE_M = 10; // 10 mét - minUpdateDistanceMeters
    
    // Location status codes
    public static final int STATUS_UNKNOWN = -1;
    public static final int STATUS_VALID = 0;
    public static final int STATUS_SUSPICIOUS = 1;
    public static final int STATUS_FAKE = 2;
    public static final int STATUS_NO_LOCATION = 3;
    
    // Location source
    public static final String SOURCE_GOOGLE = "google";
    public static final String SOURCE_NATIVE = "native";
    public static final String SOURCE_EXIST = "exist";
    
    // Refresh types
    public static final int REFRESH_TYPE_NORMAL = 2;
    public static final int REFRESH_TYPE_FORCE = 1;
    public static final int REFRESH_TYPE_CACHE = 0;
    
    // Current client name
    private String clientName = SOURCE_NATIVE;
    private Map<String, Object> cachedLocationData = null;
    
    public SecureLocationClient(Context context, LocationUpdateListener listener) {
        this.context = context;
        this.listener = listener;
        this.locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    }
    
    public void startLocationUpdates() {
        try {
            // Ưu tiên dùng GPS provider
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    MIN_TIME_MS,
                    MIN_DISTANCE_M,
                    this,
                    Looper.getMainLooper()
                );
            }
            
            // Thêm Network provider làm backup
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    MIN_TIME_MS,
                    MIN_DISTANCE_M,
                    this,
                    Looper.getMainLooper()
                );
            }
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }
    
    public void stopLocationUpdates() {
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }
    }

    public Map<String, Object> getLastKnownLocation() {
        if (this.cachedLocationData != null) {
            return this.cachedLocationData;
        }
        Location bestLocation = null;
        try {
            Location gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            
            // Logic chọn location tốt nhất (mới nhất)
            if (gpsLocation != null && networkLocation != null) {
                if (gpsLocation.getTime() > networkLocation.getTime()) {
                    bestLocation = gpsLocation;
                } else {
                    bestLocation = networkLocation;
                }
            } else if (gpsLocation != null) {
                bestLocation = gpsLocation;
            } else if (networkLocation != null) {
                bestLocation = networkLocation;
            }
        } catch (SecurityException e) {
            e.printStackTrace();
        }
        
        if (bestLocation != null) {
            Map<String, Object> result = processAndValidateLocation(bestLocation);
            result.put("source", 0); // Mark as cached (SRC_EXIST)
            result.put("refreshType", REFRESH_TYPE_CACHE);
            return result;
        }
        return null;
    }
    
    @Override
    public void onLocationChanged(@NonNull Location location) {
        // Xử lý và kiểm tra vị trí
        Map<String, Object> locationData = processAndValidateLocation(location);
        this.cachedLocationData = locationData;
        
        // Gửi về listener
        if (listener != null) {
            listener.onLocationUpdate(locationData);
        }
    }
    
    private Map<String, Object> processAndValidateLocation(Location location) {
        Map<String, Object> result = new HashMap<>();
        
        if (location.getLatitude() == 0.0 && location.getLongitude() == 0.0) {
            result.put("isValid", false);
            result.put("error", "Invalid coordinates (0,0)");
            return result;
        }
        
        // =============== KIỂM TRA MOCK LOCATION ===============
        boolean isFromMock = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
             isFromMock = location.isFromMockProvider();
        }
        
        AntiCheatPlugin.setMockLocationDetected(isFromMock);
        result.put("isFromMockProvider", isFromMock);
        
        // =============== LẤY SỐ VỆ TINH GPS ===============
        int satellites = 0;
        Bundle extras = location.getExtras();
        if (extras != null) {
            satellites = extras.getInt("satellites", 0);
        }
        result.put("satellites", satellites);
        
        // =============== LẤY THÔNG TIN ĐẦY ĐỦ ===============
        result.put("latitude", location.getLatitude());
        result.put("longitude", location.getLongitude());
        
        double altitude = location.hasAltitude() ? location.getAltitude() : Double.MIN_VALUE;
        result.put("altitude", altitude);
        result.put("hasAltitude", location.hasAltitude());
        
        result.put("speed", location.hasSpeed() ? location.getSpeed() * 3.6 : 0.0);
        result.put("speedMps", location.hasSpeed() ? location.getSpeed() : 0.0);
        
        result.put("accuracy", location.getAccuracy());
        
        float bearing = location.hasBearing() ? location.getBearing() : 0.0f;
        result.put("bearing", bearing);
        result.put("hasBearing", location.hasBearing());
        
        result.put("provider", location.getProvider());
        result.put("type", location.getProvider());
        
        result.put("locationClientName", clientName);
        
        int sourceCode = 0;
        if ("native".equals(clientName)) sourceCode = 2;
        else if ("google".equals(clientName)) sourceCode = 1;
        result.put("source", sourceCode);
        
        result.put("gpsTime", location.getTime());
        result.put("createTime", location.getTime());
        result.put("systemTime", System.currentTimeMillis());
        
        // =============== ĐÁNH GIÁ ĐỘ TIN CẬY ===============
        int trustScore = 100;
        StringBuilder warnings = new StringBuilder();
        
        if (isFromMock) {
            trustScore -= 100;
            warnings.append("CRITICAL: Mock location provider detected. ");
        }
        
        if (LocationManager.GPS_PROVIDER.equals(location.getProvider()) && satellites == 0) {
            trustScore -= 50;
            warnings.append("WARNING: GPS provider but no satellites. ");
        }
        
        if (satellites > 0 && satellites < 4) {
            trustScore -= 20;
            warnings.append("WARNING: Low satellite count. ");
        }
        
        if (!location.hasAltitude() || location.getAltitude() == 0) {
            trustScore -= 5;
            warnings.append("NOTICE: No altitude data. ");
        }
        
        result.put("trustScore", Math.max(0, trustScore));
        result.put("warnings", warnings.toString());
        result.put("isValid", trustScore > 30);
        result.put("isTrusted", trustScore >= 80);
        result.put("isSuspicious", trustScore < 50);
        result.put("isFake", trustScore <= 0 || isFromMock);
        
        int status;
        if (trustScore <= 0 || isFromMock) {
            status = STATUS_FAKE;
        } else if (trustScore < 50) {
            status = STATUS_SUSPICIOUS;
        } else {
            status = STATUS_VALID;
        }
        result.put("status", status);
        
        result.put("refreshType", REFRESH_TYPE_NORMAL);
        
        boolean hasValidCoords = location.getLatitude() != Double.MIN_VALUE 
                && location.getLongitude() != Double.MIN_VALUE;
        result.put("hasValidCoords", hasValidCoords);
        
        return result;
    }
    
    @Override
    public void onProviderEnabled(@NonNull String provider) {
        if (listener != null) {
            listener.onProviderChanged(provider, true);
        }
    }
    
    @Override
    public void onProviderDisabled(@NonNull String provider) {
        if (listener != null) {
            listener.onProviderChanged(provider, false);
        }
    }
}
