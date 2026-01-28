import { client } from "@/client-timekeeping/client.gen";
import { getLocation, getAccessToken, authorize } from "zmp-sdk/apis";

export interface ZaloLocationData {
  latitude: number;
  longitude: number;
  provider?: string;
  timestamp?: string;
}

export const ZaloService = {
  /**
   * Get user location following the new Zalo Mini App guide (Token exchange)
   */
  async getUserLocation(): Promise<ZaloLocationData> {
    try {
      console.log("[ZaloService] >>> START getUserLocation flow");

      // 1. Get location token from ZMP SDK
      console.log("[ZaloService] 1. Calling getLocation API...");
      // @ts-ignore
      let locationRes = await getLocation({});

      // If token is missing, attempt explicit authorize
      if (!(locationRes as any).token && !(locationRes as any).latitude) {
        console.log(
          "[ZaloService] 1. Token empty, attempting explicit authorize...",
        );
        try {
          await authorize({ scopes: ["scope.userLocation"] });
          console.log(
            "[ZaloService] 1. Authorize successful, retrying getLocation...",
          );
          locationRes = await getLocation({});
        } catch (authError) {
          console.error("[ZaloService] 1. Authorize failed:", authError);
        }
      }

      console.log(
        "[ZaloService] 1. getLocation response:",
        JSON.stringify(locationRes),
      );

      const token = (locationRes as any).token;

      // Handle fallback: If token is empty but coordinates are present (legacy flow or emulator)
      if (
        !token &&
        (locationRes as any).latitude &&
        (locationRes as any).longitude
      ) {
        console.warn(
          "[ZaloService] 1. WARNING: Token is empty but coordinates found (Legacy Flow/Emulator). Using them as fallback.",
        );
        return {
          latitude: Number((locationRes as any).latitude),
          longitude: Number((locationRes as any).longitude),
          provider: (locationRes as any).provider || "gps",
          timestamp: String((locationRes as any).timestamp || Date.now()),
        };
      }

      if (!token) {
        console.error(
          "[ZaloService] 1. ERROR: No token and no coordinates in getLocation response",
        );
        throw new Error(
          "Vui lòng cấp quyền truy cập vị trí trong cài đặt Zalo để tiếp tục.",
        );
      }

      console.log("[ZaloService] 2. Calling getAccessToken API...");
      // 2. Get user access token
      const accessToken = await getAccessToken({});
      console.log(
        "[ZaloService] 2. getAccessToken response length:",
        accessToken?.length,
      );

      console.log(
        "[ZaloService] 3. Exchanging tokens with backend: /api/v3/zalo/location",
      );

      // 3. Send tokens to backend to exchange for actual coordinates
      try {
        const response = await client.post({
          url: "/api/v3/zalo/location",
          body: {
            code: token,
            accessToken: accessToken,
          },
        });

        console.log(
          "[ZaloService] 3. Backend response status:",
          response.error ? "ERROR" : "SUCCESS",
        );
        if (response.data) {
          console.log(
            "[ZaloService] 3. Backend response data:",
            JSON.stringify(response.data),
          );
        }

        if (response.error) {
          console.error("[ZaloService] 3. ERROR from backend:", response.error);
          throw response.error;
        }

        const result = response.data as any;
        if (result.error !== 0 || !result.data) {
          console.error(
            "[ZaloService] 3. ERROR: Logic error in response data",
            result,
          );
          throw new Error(
            result.message || "Failed to exchange location token",
          );
        }

        console.log(
          "[ZaloService] <<< SUCCESS: Coordinates received from backend:",
          result.data.latitude,
          result.data.longitude,
        );

        return {
          latitude: Number(result.data.latitude),
          longitude: Number(result.data.longitude),
          provider: result.data.provider,
          timestamp: result.data.timestamp,
        };
      } catch (exchangeError) {
        console.warn(
          "[ZaloService] 3. Token exchange failed, falling back to direct GPS from SDK:",
          exchangeError,
        );
        // FINAL FALLBACK: Use coordinates from initial SDK call if they exist
        if ((locationRes as any).latitude && (locationRes as any).longitude) {
          return {
            latitude: Number((locationRes as any).latitude),
            longitude: Number((locationRes as any).longitude),
            provider: (locationRes as any).provider || "gps",
            timestamp: String((locationRes as any).timestamp || Date.now()),
          };
        }
        throw exchangeError;
      }
    } catch (error) {
      console.error("[ZaloService] !!! FATAL ERROR in getUserLocation:", error);
      throw error;
    }
  },
};
