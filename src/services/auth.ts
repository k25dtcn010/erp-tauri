import { client } from "../client/client.gen";
import { client as timekeepingClient } from "../client-timekeeping/client.gen";
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

// --- Global Interceptor ---
let interceptorsInitialized = false;

const coreAuthInterceptor = async (request: any) => {
  const [token, companyId] = await Promise.all([
    DeviceStorage.getItem("token"),
    DeviceStorage.getItem("companyId"),
  ]);

  if (token) request.headers.set("Authorization", `Bearer ${token}`);
  if (companyId) request.headers.set("X-Company-Id", companyId);

  return request;
};

const timekeepingAuthInterceptor = async (request: any) => {
  const [token, userId, employeeId, companyId] = await Promise.all([
    DeviceStorage.getItem("token"),
    DeviceStorage.getItem("userId"),
    DeviceStorage.getItem("employeeId"),
    DeviceStorage.getItem("companyId"),
  ]);

  if (token) request.headers.set("Authorization", `Bearer ${token}`);
  if (companyId) request.headers.set("X-Company-Id", companyId);
  if (userId) request.headers.set("X-User-ID", userId);
  if (employeeId) request.headers.set("X-Employee-ID", employeeId);

  return request;
};

const setupInterceptors = () => {
  if (interceptorsInitialized) return;

  if (client.interceptors) {
    client.interceptors.request.use(coreAuthInterceptor);
  }
  if (timekeepingClient.interceptors) {
    timekeepingClient.interceptors.request.use(timekeepingAuthInterceptor);
  }

  interceptorsInitialized = true;
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

      const { token, user, refreshToken } =
        (response.data as any).data || (response.data as any);

      if (!token) {
        throw new Error("Token not found in response");
      }

      if (credentials.companyId) {
        await DeviceStorage.setItem("companyId", credentials.companyId);
      }

      // Save token to storage
      await DeviceStorage.setItem("token", token);
      if (refreshToken) {
        await DeviceStorage.setItem("refreshToken", refreshToken);
      }

      if (user) {
        if (user.userId) await DeviceStorage.setItem("userId", user.userId);
        if (user.id) await DeviceStorage.setItem("employeeId", user.id);
      }

      setupInterceptors();
      return { token, user };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  getCompanyId: async () => {
    return await DeviceStorage.getItem("companyId");
  },

  getAccessToken: async () => {
    return await DeviceStorage.getItem("token");
  },

  getUserId: async () => {
    let userId = await DeviceStorage.getItem("userId");
    if (!userId || userId === "undefined" || userId === "null") {
      try {
        const result = await authService.getSession();
        if (
          result &&
          result.data &&
          (result.data as any).data &&
          (result.data as any).data.userId
        ) {
          userId = (result.data as any).data.userId;
        }
      } catch (e) {
        console.warn("Could not retrieve userId via session", e);
      }
    }
    return userId;
  },

  getEmployeeId: async () => {
    let employeeId = await DeviceStorage.getItem("employeeId");
    if (!employeeId || employeeId === "undefined" || employeeId === "null") {
      try {
        const result = await authService.getSession();
        if (
          result &&
          result.data &&
          (result.data as any).data &&
          (result.data as any).data.id
        ) {
          employeeId = (result.data as any).data.id;
        }
      } catch (e) {
        console.warn("Could not retrieve employeeId via session", e);
      }
    }
    return employeeId;
  },

  logout: async () => {
    try {
      await DeviceStorage.removeItem("token");
      await DeviceStorage.removeItem("refreshToken");
      await DeviceStorage.removeItem("userId");
      await DeviceStorage.removeItem("employeeId");
      await DeviceStorage.removeItem("companyId");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  getSession: async () => {
    // getApiEmployeesMe returns the current user's profile if authenticated
    try {
      const result = await getApiEmployeesMe();

      if (
        result.data &&
        (result.data as any).data &&
        (result.data as any).data.id
      ) {
        const employeeId = (result.data as any).data.id;
        const userId = (result.data as any).data.userId;
        await DeviceStorage.setItem("employeeId", employeeId);
        if (userId) {
          await DeviceStorage.setItem("userId", userId);
        }
      } else {
        console.warn(
          "[Auth] getSession NO DATA FOUND IN result.data:",
          JSON.stringify(result.data),
        );
      }

      return result;
    } catch (e) {
      console.error("[Auth] getApiEmployeesMe threw error:", e);
      throw e;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = await DeviceStorage.getItem("refreshToken");

      if (!refreshToken || typeof refreshToken !== "string") {
        throw new Error("No refresh token");
      }

      const response = await client.post({
        url: "/api/auth/refresh",
        body: { refreshToken },
      });

      if (response.data && (response.data as any).token) {
        const { token, refreshToken: newRefreshToken } = response.data as any;

        await DeviceStorage.setItem("token", token);
        if (newRefreshToken) {
          await DeviceStorage.setItem("refreshToken", newRefreshToken);
        }

        setupInterceptors();
        return true;
      }
      return false;
    } catch (error) {
      console.error("[Auth] Refresh token failed:", error);
      return false;
    }
  },

  initialize: async () => {
    try {
      const token = await DeviceStorage.getItem("token");

      if (token && typeof token === "string") {
        setupInterceptors();
        return true;
      }
      return false;
    } catch (error) {
      console.error("[Auth] Auth initialization failed:", error);
      return false;
    }
  },

  checkAuth: async () => {
    try {
      const hasToken = await authService.initialize();

      if (!hasToken) return false;

      // Verify token by fetching user profile
      const response = await authService.getSession();

      if (response.error) {
        // Try refresh
        console.warn(
          "[Auth] Session check failed, trying refresh...",
          response.error,
        );
        const refreshed = await authService.refreshToken();

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

setupInterceptors();
