import { client } from "../client/client.gen";
import {
  getApiCompaniesByUsernameByUsername,
  getApiEmployeesMe,
} from "../client/sdk.gen";
import { nativeStorage } from "zmp-sdk/apis";

// --- Storage Helper ---
const DeviceStorage = {
  setItem: async (key: string, value: string) => {
    try {
      await nativeStorage.setItem(key, value);
    } catch (e) {
      console.warn(
        `[Storage] nativeStorage setItem failed for ${key}, fallback to localStorage`,
        e,
      );
      try {
        localStorage.setItem(key, value);
      } catch (localError) {
        console.error(`[Storage] localStorage setItem also failed`, localError);
      }
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await nativeStorage.getItem(key);
      if ((value as any)?.error) throw (value as any).error;
      return typeof value === "string" ? value : ((value as any)?.data ?? null);
    } catch (e) {
      console.warn(
        `[Storage] nativeStorage getItem failed for ${key}, fallback to localStorage`,
        e,
      );
      return localStorage.getItem(key);
    }
  },
  removeItem: async (key: string) => {
    try {
      await nativeStorage.removeItem(key);
    } catch (e) {
      console.warn(
        `[Storage] nativeStorage removeItem failed for ${key}, fallback to localStorage`,
        e,
      );
      localStorage.removeItem(key);
    }
  },
};

export interface LoginCredentials {
  username: string;
  password?: string;
  companyId?: string;
}

export const authService = {
  getUserCompanies: async (username: string) => {
    try {
      const response = await getApiCompaniesByUsernameByUsername({
        path: { username },
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await client.post({
        url: "/api/auth/sign-in/username",
        body: credentials,
      });

      if (response.error) {
        throw response.error;
      }

      const { token, user, refreshToken } = response.data as any;

      if (!token) {
        throw new Error("Token not found in response");
      }

      // Save token to storage
      await DeviceStorage.setItem("token", token);
      if (refreshToken) {
        await DeviceStorage.setItem("refreshToken", refreshToken);
      }

      // Setup interceptor for subsequent requests
      if (client.interceptors) {
        client.interceptors.request.use((request) => {
          request.headers.set("Authorization", `Bearer ${token}`);
          return request;
        });
      }

      return { token, user };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await DeviceStorage.removeItem("token");
      await DeviceStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  getSession: async () => {
    console.log("[Auth] Getting session (getApiEmployeesMe)...");
    // getApiEmployeesMe returns the current user's profile if authenticated
    try {
      const result = await getApiEmployeesMe();
      console.log("[Auth] getApiEmployeesMe result:", result);
      return result;
    } catch (e) {
      console.error("[Auth] getApiEmployeesMe threw error:", e);
      throw e;
    }
  },

  refreshToken: async () => {
    console.log("[Auth] Attempting refresh token...");
    try {
      const refreshToken = await DeviceStorage.getItem("refreshToken");
      console.log(
        "[Auth] Stored refresh token:",
        refreshToken ? "FOUND" : "NOT FOUND",
      );

      if (!refreshToken || typeof refreshToken !== "string") {
        throw new Error("No refresh token");
      }

      const response = await client.post({
        url: "/api/auth/refresh",
        body: { refreshToken },
      });

      console.log("[Auth] Refresh token response:", response);

      if (response.data && (response.data as any).token) {
        const { token, refreshToken: newRefreshToken } = response.data as any;
        console.log("[Auth] New token received:", token ? "YES" : "NO");

        await DeviceStorage.setItem("token", token);
        if (newRefreshToken) {
          await DeviceStorage.setItem("refreshToken", newRefreshToken);
        }

        client.interceptors.request.use((request) => {
          request.headers.set("Authorization", `Bearer ${token}`);
          return request;
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("[Auth] Refresh token failed:", error);
      return false;
    }
  },

  initialize: async () => {
    console.log("[Auth] Initializing...");
    try {
      const token = await DeviceStorage.getItem("token");
      console.log("[Auth] Stored token:", token ? "FOUND" : "NOT FOUND");

      if (token && typeof token === "string") {
        client.interceptors.request.use((request) => {
          request.headers.set("Authorization", `Bearer ${token}`);
          return request;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("[Auth] Auth initialization failed:", error);
      return false;
    }
  },

  checkAuth: async () => {
    console.log("[Auth] Checking auth...");
    try {
      const hasToken = await authService.initialize();
      console.log("[Auth] hasToken:", hasToken);

      if (!hasToken) return false;

      // Verify token by fetching user profile
      const response = await authService.getSession();
      console.log("[Auth] Session response:", response);

      if (response.error) {
        // Try refresh
        console.warn(
          "[Auth] Session check failed, trying refresh...",
          response.error,
        );
        const refreshed = await authService.refreshToken();
        console.log("[Auth] Refresh result:", refreshed);

        if (refreshed) {
          // Retry session check or just return true as we have a fresh token
          return true;
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("[Auth] Check auth error:", error);
      return false;
    }
  },
};
