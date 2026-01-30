import { create } from "zustand";
import { getApiEmployeesMe } from "@/client/sdk.gen";

interface UserState {
  userName: string;
  userAvatar: string;
  employeeCode: string;
  employeeId: string;
  isOnline: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setIsOnline: (isOnline: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  userName: localStorage.getItem("cached_userName") || "",
  userAvatar: localStorage.getItem("cached_userAvatar") || "",
  employeeCode: localStorage.getItem("cached_employeeCode") || "",
  employeeId: localStorage.getItem("cached_employeeId") || "",
  isOnline: navigator.onLine,
  isLoading: false,

  setIsOnline: (isOnline) => set({ isOnline }),

  fetchUser: async () => {
    // If we already have data and not forced, we can skip or re-validate
    set({ isLoading: true });
    try {
      const res = await getApiEmployeesMe();
      if (res.data) {
        const data = (res.data as any).data;
        const fullName = data.fullName || "";
        const avatar = data.avatarUrl || "";
        const code = data.employeeCode || "";
        const id = data.id || "";

        set({
          userName: fullName,
          userAvatar: avatar,
          employeeCode: code,
          employeeId: id,
        });

        // Sync with localStorage for persistence across reloads
        localStorage.setItem("cached_userName", fullName);
        localStorage.setItem("cached_userAvatar", avatar);
        localStorage.setItem("cached_employeeCode", code);
        localStorage.setItem("cached_employeeId", id);
      }
    } catch (error) {
      console.error("[UserStore] Failed to fetch user:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
