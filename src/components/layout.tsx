import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  ZMPRouter,
  SnackbarProvider,
  Box,
  useLocation,
  useNavigate,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { useEffect, useState, useMemo } from "react";
import { authService } from "@/services/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import AttendanceHistoryPage from "@/pages/attendance-history";
import LeavePage from "@/pages/leave";
import OvertimePage from "@/pages/overtime";
import SettingsPage from "@/pages/settings";
import UnderDevelopmentPage from "@/pages/under-development";
import BottomNav from "./BottomNav";
import AndroidRestrictionModal from "./AndroidRestrictionModal";
import { useUserStore } from "@/store/user-store";
import { useAppConfigStore } from "@/store/config-store";
import BadgeNotification from "./layout/BadgeNotification";

const LayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const { fetchUser, setIsOnline } = useUserStore();
  const { badges, dismissedBadgeIds, snoozedBadgeIds, fetchConfigs } =
    useAppConfigStore();

  useEffect(() => {
    if (!isLoginPage) {
      fetchConfigs();
    }
  }, [isLoginPage, fetchConfigs]);

  const activeBadges = useMemo(() => {
    return badges.filter((b) => {
      // Check if permanently dismissed in current session
      if (dismissedBadgeIds.includes(b.id)) return false;

      // Check if snoozed for 24h
      const snoozeExpiry = snoozedBadgeIds[b.id];
      if (snoozeExpiry && Date.now() < snoozeExpiry) return false;

      return true;
    });
  }, [badges, dismissedBadgeIds, snoozedBadgeIds]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    if (!isLoginPage) {
      fetchUser();
    }
  }, [isLoginPage, fetchUser]);

  useEffect(() => {
    const check = async () => {
      if (isLoginPage) return;

      const isAuth = await authService.checkAuth();
      if (isAuth) return;

      console.warn("[Layout] Not authenticated, redirecting to /login");
      navigate("/login");
    };
    check();
  }, [isLoginPage, navigate]);

  return (
    <Box className="flex-1 flex flex-col overflow-hidden">
      {!isLoginPage
        ? activeBadges.map((badge) => (
            <BadgeNotification key={badge.id} badge={badge} />
          ))
        : null}
      <AnimationRoutes>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/" element={<DashboardPage />}></Route>
        <Route
          path="/attendance-history"
          element={<AttendanceHistoryPage />}
        ></Route>
        <Route path="/leave" element={<LeavePage />}></Route>
        <Route path="/overtime" element={<OvertimePage />}></Route>
        <Route path="/settings" element={<SettingsPage />}></Route>
        <Route path="*" element={<UnderDevelopmentPage />}></Route>
      </AnimationRoutes>
      {!isLoginPage ? <BottomNav /> : null}

      <AndroidRestrictionModal />
    </Box>
  );
};

// Create QueryClient instance outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache retention (formerly cacheTime)
      refetchOnWindowFocus: true, // Auto refetch when window regains focus
      refetchOnReconnect: true, // Auto refetch when reconnecting
      retry: 1, // Retry failed requests once
    },
  },
});

const Layout = () => {
  const [theme, setTheme] = useState<AppProps["theme"]>("light");

  useEffect(() => {
    try {
      const info = getSystemInfo();
      setTheme(info.zaloTheme as AppProps["theme"]);
    } catch (e) {
      console.error("Error getting theme:", e);
    }
  }, []);

  return (
    <App theme={theme}>
      <Box flex flexDirection="column" className="h-screen">
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <ZMPRouter>
              <LayoutContent />
            </ZMPRouter>
          </SnackbarProvider>
        </QueryClientProvider>
      </Box>
    </App>
  );
};
export default Layout;
