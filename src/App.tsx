import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "./components/layout/Layout";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { AttendanceHistory } from "./pages/AttendanceHistory";
import { LeaveManagement } from "./pages/LeaveManagement";
import { OvertimeManagement } from "./pages/OvertimeManagement";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/attendance" element={<AttendanceHistory />} />
          <Route path="/leaves" element={<LeaveManagement />} />
          <Route path="/overtime" element={<OvertimeManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
