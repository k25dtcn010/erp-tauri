import React, { useState, useCallback } from "react";
import {
  Page,
  Box,
  Text,
  Input,
  Button,
  useSnackbar,
  useNavigate,
  Icon,
} from "zmp-ui";
import { authService } from "@/services/auth";

const { OTP } = Input;

// --- Types ---
type LoginStep = "username" | "company" | "password" | "changePassword";

interface UserCompany {
  id: string;
  name: string;
  isPrimary: boolean;
  role?: string;
  employeeName: string;
  avatarUrl?: string;
  mustChangePassword?: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  // --- State ---
  const [step, setStep] = useState<LoginStep>("username");
  const [loading, setLoading] = useState(false);

  // Data State
  const [username, setUsername] = useState("");
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<UserCompany | null>(
    null,
  );
  const [employeeInfo, setEmployeeInfo] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);

  // Password State
  const [password, setPassword] = useState("");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Handlers ---
  const handleSwitchCompany = useCallback(() => {
    setStep("company");
    setPassword("");
  }, []);

  const handleBack = useCallback(() => {
    setStep("username");
    setCompanies([]);
    setSelectedCompany(null);
    setEmployeeInfo(null);
    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, []);

  const handleUsernameSubmit = useCallback(async () => {
    if (!username.trim()) {
      openSnackbar({ type: "error", text: "Vui lòng nhập tên đăng nhập" });
      return;
    }

    setLoading(true);
    try {
      const data = await authService.getUserCompanies(username);
      setLoading(false);

      // Map API response to UserCompany
      let apiCompanies: any[] = [];
      let globalMustChangePassword = false;

      if (Array.isArray(data)) {
        apiCompanies = data;
      } else {
        const anyData = data as any;
        if (Array.isArray(anyData.data)) {
          apiCompanies = anyData.data;
        } else if (Array.isArray(anyData.companies)) {
          apiCompanies = anyData.companies;
        }

        if (anyData.mustChangePassword === true) {
          globalMustChangePassword = true;
        }
      }

      const mappedCompanies: UserCompany[] = apiCompanies.map((c: any) => ({
        id: c.companyId || c.id,
        name: c.companyName || c.name,
        isPrimary: c.isPrimary || false,
        role: c.role || "N/A",
        employeeName: c.employeeName || c.name || "User",
        avatarUrl: c.avatarUrl,
        mustChangePassword: c.mustChangePassword || globalMustChangePassword,
      }));

      if (mappedCompanies.length > 0) {
        setCompanies(mappedCompanies);
        setEmployeeInfo({
          name: mappedCompanies[0].employeeName,
          avatar: mappedCompanies[0].avatarUrl,
        });

        const mustChange = mappedCompanies.some((c) => c.mustChangePassword);

        if (mustChange) {
          setStep("changePassword");
        } else if (mappedCompanies.length > 1) {
          setStep("company");
        } else {
          setSelectedCompany(mappedCompanies[0]);
          setStep("password");
        }
      } else {
        openSnackbar({
          type: "error",
          text: "Không tìm thấy người dùng hoặc công ty liên kết.",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      openSnackbar({
        type: "error",
        text: "Lỗi kết nối hoặc không tìm thấy người dùng.",
      });
    }
  }, [username, openSnackbar]);

  const handleCompanySelect = useCallback((company: UserCompany) => {
    setSelectedCompany(company);
    setStep("password");
  }, []);

  const handleLogin = useCallback(async () => {
    if (password.length < 6) {
      openSnackbar({ type: "warning", text: "Mật khẩu phải đủ 6 ký tự" });
      return;
    }

    setLoading(true);
    try {
      await authService.login({
        username,
        password,
        companyId: selectedCompany?.id,
      });
      setLoading(false);
      openSnackbar({ type: "success", text: "Đăng nhập thành công!" });
      navigate("/");
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      openSnackbar({
        type: "error",
        text: `Đăng nhập thất bại: ${error?.message || "Kiểm tra lại thông tin"}`,
      });
      setPassword("");
    }
  }, [password, username, selectedCompany, openSnackbar, navigate]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      openSnackbar({ type: "warning", text: "Vui lòng điền đầy đủ thông tin" });
      return;
    }
    if (newPassword !== confirmPassword) {
      openSnackbar({ type: "error", text: "Mật khẩu mới không khớp" });
      return;
    }
    if (newPassword.length < 6) {
      openSnackbar({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    openSnackbar({
      type: "success",
      text: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
    });

    handleBack();
  }, [currentPassword, newPassword, confirmPassword, openSnackbar, handleBack]);

  // --- Render Helpers ---

  const renderUserInfo = () => {
    if (!employeeInfo && !username) return null;
    return (
      <Box className="bg-gray-100 rounded-xl p-4 mb-6 flex items-center border border-gray-200">
        <Box className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mr-4 overflow-hidden">
          {employeeInfo?.avatar ? (
            <img
              src={employeeInfo.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <Text className="font-bold text-xl text-black">
              {(employeeInfo?.name || username)[0].toUpperCase()}
            </Text>
          )}
        </Box>
        <Box className="flex-1">
          <Text className="font-bold text-base">
            {employeeInfo?.name || username}
          </Text>
          {step === "password" && selectedCompany ? (
            <Text className="text-gray-500 text-sm">
              {selectedCompany.name}
            </Text>
          ) : null}
        </Box>
        <Button
          icon={<Icon icon="zi-edit-text" />}
          size="small"
          variant="tertiary"
          onClick={handleBack}
          className="rounded-full w-8 h-8 p-0"
        />
      </Box>
    );
  };

  return (
    <Page className="flex flex-col bg-white h-full justify-center">
      <Box p={6} className="w-full max-w-md mx-auto">
        {/* Header Section */}
        <Box className="text-center mb-8">
          {step === "username" ? (
            <>
              <Box className="flex justify-center mb-6">
                <Icon icon="zi-lock" className="text-yellow-400 text-6xl" />
              </Box>
              <Text.Title size="xLarge" className="font-bold mb-2">
                Đăng Nhập
              </Text.Title>
              <Text className="text-gray-500">
                Vui lòng nhập tên đăng nhập để tiếp tục
              </Text>
            </>
          ) : null}

          {step === "company" ? (
            <>
              <Text.Title size="xLarge" className="font-bold mb-2">
                Chọn Công Ty
              </Text.Title>
              <Text className="text-gray-500">
                Chọn công ty bạn muốn truy cập
              </Text>
            </>
          ) : null}

          {step === "password" ? (
            <>
              <Text.Title size="xLarge" className="font-bold mb-2">
                Nhập Mật Khẩu
              </Text.Title>
              <Text className="text-gray-500">
                Truy cập an toàn vào tài khoản của bạn
              </Text>
            </>
          ) : null}
          {step === "changePassword" ? (
            <>
              <Text.Title size="xLarge" className="font-bold mb-2">
                Đổi Mật Khẩu
              </Text.Title>
              <Text className="text-gray-500">
                Bạn cần đổi mật khẩu để tiếp tục
              </Text>
            </>
          ) : null}
        </Box>

        {/* User Info (Skipped for Username step) */}
        {step !== "username" ? renderUserInfo() : null}

        {/* Step 1: Username */}
        {step === "username" ? (
          <Box className="space-y-6">
            <Box>
              <Text size="small" className="font-semibold mb-1">
                Tên đăng nhập
              </Text>
              <Input
                placeholder="Nhập tên đăng nhập (ví dụ: user1)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                clearable
                className="h-12 text-lg rounded-xl"
              />
            </Box>
            <Button
              fullWidth
              size="large"
              loading={loading}
              onClick={handleUsernameSubmit}
              className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-xl font-bold"
            >
              Tiếp tục
            </Button>
          </Box>
        ) : null}

        {/* Step 2: Company Selection */}
        {step === "company" ? (
          <Box className="space-y-4 max-h-[60vh] overflow-y-auto">
            {companies.map((company) => (
              <Box
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className={`p-4 rounded-xl border-2 flex items-center cursor-pointer transition-all ${
                  selectedCompany?.id === company.id
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-yellow-200"
                }`}
              >
                <Box
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                    selectedCompany?.id === company.id
                      ? "bg-yellow-400"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    icon="zi-location"
                    className={
                      selectedCompany?.id === company.id
                        ? "text-black"
                        : "text-gray-500"
                    }
                  />
                </Box>
                <Box className="flex-1">
                  <Box className="flex items-center">
                    <Text className="font-bold mr-2">{company.name}</Text>
                    {company.isPrimary ? (
                      <span className="bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full text-black">
                        MẶC ĐỊNH
                      </span>
                    ) : null}
                  </Box>
                  {company.role ? (
                    <Text size="small" className="text-gray-500">
                      {company.role}
                    </Text>
                  ) : null}
                </Box>
                {selectedCompany?.id === company.id ? (
                  <Icon
                    icon="zi-check-circle-solid"
                    className="text-yellow-400"
                  />
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}

        {/* Step 3: Password */}
        {step === "password" ? (
          <Box className="space-y-6">
            <Box>
              <Text
                size="small"
                className="font-semibold mb-2 text-center block"
              >
                Mật khẩu (6 chữ số)
              </Text>
              <Box className="flex justify-center">
                <OTP
                  defaultValue=""
                  otpLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value.length === 6) {
                      setTimeout(
                        () => document.getElementById("btn-login")?.click(),
                        100,
                      );
                    }
                  }}
                  className="bg-transparent"
                />
              </Box>
            </Box>
            <Button
              id="btn-login"
              fullWidth
              size="large"
              loading={loading}
              onClick={handleLogin}
              disabled={password.length !== 6}
              className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-xl font-bold"
            >
              Đăng Nhập
            </Button>
            <Box className="text-center">
              <Text className="text-yellow-600 font-bold cursor-pointer">
                Quên mật khẩu?
              </Text>
            </Box>
          </Box>
        ) : null}

        {/* Change Password Step */}
        {step === "changePassword" ? (
          <Box className="space-y-4">
            <Box>
              <Text size="small" className="font-semibold mb-1">
                Mật khẩu hiện tại
              </Text>
              <Box className="flex justify-center">
                <OTP
                  defaultValue=""
                  otpLength={6}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Box>
            </Box>
            <Box>
              <Text size="small" className="font-semibold mb-1">
                Mật khẩu mới
              </Text>
              <Box className="flex justify-center">
                <OTP
                  defaultValue=""
                  otpLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Box>
            </Box>
            <Box>
              <Text size="small" className="font-semibold mb-1">
                Nhập lại mật khẩu mới
              </Text>
              <Box className="flex justify-center">
                <OTP
                  defaultValue=""
                  otpLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Box>
            </Box>

            <Box className="flex gap-4 mt-6">
              <Button
                fullWidth
                variant="secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Quay lại
              </Button>
              <Button
                fullWidth
                loading={loading}
                onClick={handleChangePassword}
                className="bg-yellow-400 text-black font-bold"
              >
                Đổi Mật Khẩu
              </Button>
            </Box>
          </Box>
        ) : null}

        {/* Footer for Version */}
        <Box className="mt-8 text-center">
          <Text size="xSmall" className="text-gray-400">
            Phiên bản 1.0.0
          </Text>
        </Box>
      </Box>
    </Page>
  );
};

export default LoginPage;
