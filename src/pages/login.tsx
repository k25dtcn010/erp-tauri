import React, { useState } from "react";
import {
  Page,
  Box,
  Text,
  Input,
  Button,
  useSnackbar,
  useNavigate,
} from "zmp-ui";

const { OTP } = Input;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  const handleLogin = () => {
    if (!username || otp.length < 4) {
      openSnackbar({
        type: "error",
        text: "Vui lòng nhập đầy đủ thông tin",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      openSnackbar({
        type: "success",
        text: "Đăng nhập thành công!",
        duration: 2000,
      });
      navigate("/");
    }, 1500);
  };

  return (
    <Page className="flex flex-col bg-white">
      <Box p={4} mt={8} textAlign="center">
        <Text.Title size="xLarge">Đăng nhập</Text.Title>
        <Text className="text-gray-500 mt-2">Hệ thống Quản lý Chấm công</Text>
      </Box>

      <Box p={4} className="space-y-4">
        <Box>
          <Text size="small" className="font-semibold mb-1">
            Tên đăng nhập
          </Text>
          <Input
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            clearable
          />
        </Box>

        <Box>
          <Text size="small" className="font-semibold mb-1">
            Mật khẩu (OTP)
          </Text>
          <Box className="flex justify-center mt-2">
            <OTP
              otpLength={6}
              value={otp}
              defaultValue=""
              onChange={(val) => setOtp(val.target.value)}
              show={false}
            />
          </Box>
        </Box>

        <Box mt={6}>
          <Button
            fullWidth
            variant="primary"
            loading={loading}
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>
        </Box>
      </Box>

      <Box p={4} textAlign="center" className="mt-auto">
        <Text size="xSmall" className="text-gray-400">
          © 2026 Timekeeping App
        </Text>
      </Box>
    </Page>
  );
};

export default LoginPage;
