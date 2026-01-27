import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  ZMPRouter,
  SnackbarProvider,
  Box,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import AttendanceHistoryPage from "@/pages/attendance-history";
import LeavePage from "@/pages/leave";
import OvertimePage from "@/pages/overtime";
import SettingsPage from "@/pages/settings";
import BottomNav from "./BottomNav";

const Layout = () => {
  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <Box flex flexDirection="column" className="h-screen">
        <SnackbarProvider>
          <ZMPRouter>
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
              </AnimationRoutes>
              <BottomNav />
            </Box>
          </ZMPRouter>
        </SnackbarProvider>
      </Box>
    </App>
  );
};
export default Layout;
