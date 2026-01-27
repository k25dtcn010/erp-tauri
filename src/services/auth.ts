import { client } from "../client/client.gen";
import { getApiCompaniesByUsernameByUsername } from "../client/sdk.gen";
import { nativeStorage } from "zmp-sdk/apis";

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
      // Since login endpoint is not in SDK, we use client.post manually
      // Assuming standard /api/auth/login endpoint
      const response = await client.post({
        url: "/api/auth/sign-in/username",
        body: credentials,
      });

      if (response.error) {
        throw response.error;
      }

      const { token, user } = response.data as any;

      // Save token to nativeStorage
      if (token) {
        nativeStorage.setItem("token", token);

        // Setup interceptor for subsequent requests
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
      nativeStorage.removeItem("token");
      // Optionally clear interceptors or reset client config if possible
      // For now, removing the token from storage is the main step
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  initialize: () => {
    try {
      const token = nativeStorage.getItem("token");
      if (token && typeof token === "string") {
        client.interceptors.request.use((request) => {
          request.headers.set("Authorization", `Bearer ${token}`);
          return request;
        });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
    }
  },
};
