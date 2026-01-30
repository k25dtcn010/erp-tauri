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
import { useEffect, useState } from "react";
import { authService } from "@/services/auth";

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

const LayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const [isAndroid, setIsAndroid] = useState(false);
  const { fetchUser, setIsOnline } = useUserStore();

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
    try {
      const info = getSystemInfo();
      // if (info.platform === "unknown") {
      //   setIsAndroid(true);
      // }
    } catch (error) {
      console.error("[Layout] Failed to get system info:", error);
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      // If Android, we don't care about auth as they are blocked by modal
      if (isAndroid) return;

      if (!isLoginPage) {
        const isAuth = await authService.checkAuth();
        if (!isAuth) {
          console.warn("[Layout] Not authenticated, redirecting to /login");
          navigate("/login");
        } else {
        }
      } else {
      }
    };
    check();
  }, [isLoginPage, isAndroid, navigate]);

  return (
    <Box className="flex-1 flex flex-col overflow-hidden">
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
      {!isLoginPage && <BottomNav />}

      <AndroidRestrictionModal visible={isAndroid} />
    </Box>
  );
};

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
        <SnackbarProvider>
          <ZMPRouter>
            <LayoutContent />
          </ZMPRouter>
        </SnackbarProvider>
      </Box>
    </App>
  );
};
export default Layout;
