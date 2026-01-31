import { create } from "zustand";
import { getApiV3AttendanceToday } from "@/client-timekeeping/sdk.gen";
import { format } from "date-fns";

export type WorkStatus = "idle" | "working" | "paused";

interface AttendanceState {
    workStatus: WorkStatus;
    checkInTime: string | null;
    checkOutTime: string | null;
    todaySessions: any[];
    isLoading: boolean;

    // Optimistic tracking
    // We use this timestamp to ignore API updates that contradict our local state for a short period
    ignoreApiMismatchUntil: number;

    setWorkingState: (status: WorkStatus, checkIn: string | null, checkOut: string | null) => void;
    performCheckIn: (time: string) => void;
    performCheckOut: (time: string) => void;
    fetchTodayAttendance: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
    workStatus: "idle",
    checkInTime: null,
    checkOutTime: null,
    todaySessions: [],
    isLoading: false,
    ignoreApiMismatchUntil: 0,

    setWorkingState: (status, checkIn, checkOut) => set({
        workStatus: status,
        checkInTime: checkIn,
        checkOutTime: checkOut
    }),

    performCheckIn: (time) => {
        console.log("[AttendanceStore] performCheckIn (Optimistic):", time);
        set({
            workStatus: "working",
            checkInTime: time,
            checkOutTime: null,
            // Set protection window: Ignore conflicting API updates for 20 seconds
            ignoreApiMismatchUntil: Date.now() + 20000
        });
    },

    performCheckOut: (time) => {
        console.log("[AttendanceStore] performCheckOut (Optimistic):", time);
        set({
            workStatus: "idle",
            checkOutTime: time,
            // Set protection window
            ignoreApiMismatchUntil: Date.now() + 20000
        });
    },

    fetchTodayAttendance: async () => {
        set({ isLoading: true });
        try {
            const res = await getApiV3AttendanceToday();

            const { ignoreApiMismatchUntil, workStatus: localStatus } = get();
            const isProtected = Date.now() < ignoreApiMismatchUntil;

            if (res.data) {
                const { activeSession, sessions } = res.data as any;
                const sessionList = sessions || [];

                let apiStatus: WorkStatus = "idle";
                let apiCheckIn: string | null = null;
                let apiCheckOut: string | null = null;

                if (activeSession) {
                    apiStatus = "working";
                    apiCheckIn = format(new Date(activeSession.checkInAt), "HH:mm");
                } else if (sessionList.length > 0) {
                    const lastSession = sessionList[0];
                    apiStatus = "idle";
                    apiCheckIn = format(new Date(lastSession.checkInAt), "HH:mm");
                    if (lastSession.checkOutAt) {
                        apiCheckOut = format(new Date(lastSession.checkOutAt), "HH:mm");
                    }
                }

                // --- CONVERGENCE LOGIC ---
                let shouldUpdateStatus = true;

                if (isProtected) {
                    // Check if API agrees with local status
                    const isMatch = (localStatus === apiStatus);

                    if (isMatch) {
                        console.log(`[AttendanceStore] API matches local state (${apiStatus}). Syncing details.`);
                        // Note: We don't necessarily clear protection yet, let it expire or 
                        // clear it only if we're sure the data is fresh.
                        // For now, let's just allow the update.
                    } else {
                        console.log(`[AttendanceStore] IGNORING STALE API. Local: ${localStatus} vs API: ${apiStatus}. Protection active for ${Math.round((ignoreApiMismatchUntil - Date.now()) / 1000)}s`);
                        shouldUpdateStatus = false;
                    }
                }

                const updates: Partial<AttendanceState> = { todaySessions: sessionList };

                if (shouldUpdateStatus) {
                    console.log("[AttendanceStore] Applying API state:", { apiStatus, apiCheckIn, apiCheckOut });
                    updates.workStatus = apiStatus;
                    updates.checkInTime = apiCheckIn;
                    updates.checkOutTime = apiCheckOut;

                    // If we successfully synced with a 'working' or 'idle' state that matches what we expected,
                    // we can safely clear the protection.
                    if (isProtected) {
                        set({ ignoreApiMismatchUntil: 0 });
                    }
                }

                set(updates);
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
