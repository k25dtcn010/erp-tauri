import React from "react";
import { Modal, Box, Text, Button } from "zmp-ui";
import { AlertCircle, Download, ShieldAlert } from "lucide-react";

interface AndroidRestrictionModalProps {
  visible: boolean;
}

const AndroidRestrictionModal: React.FC<AndroidRestrictionModalProps> = ({
  visible,
}) => {
  const handleDownloadApp = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.fiveminutes.hrm",
      "_blank",
    );
  };

  return (
    <Modal
      visible={visible}
      maskClosable={false}
      verticalActions
      className="android-restriction-modal"
    >
      <Box className="flex flex-col items-center text-center">
        {/* Animated Security Icon Section */}
        <Box className="relative mb-8 mt-2">
          <Box className="w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Background decorative pulse */}
            <Box className="absolute inset-0 bg-red-500/10 animate-ping rounded-full" />

            <Box className="relative z-10 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center border border-red-100 dark:border-red-900/30">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </Box>
          </Box>

          <Box className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1.5 rounded-full border-4 border-white dark:border-gray-900 shadow-lg animate-bounce">
            <AlertCircle className="w-4 h-4" />
          </Box>
        </Box>

        {/* Content Section */}
        <Box className="max-w-[280px] mx-auto">
          <Text className="text-2xl font-black mb-2 text-gray-900 dark:text-white tracking-tight">
            Oops! <span className="text-red-500">Android</span> được hỗ trợ qua
            App
          </Text>

          <Box className="w-12 h-1 bg-red-500 mx-auto mb-6 rounded-full opacity-30" />

          <Box className="space-y-4 mb-8">
            <Text className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Để đảm bảo{" "}
              <span className="font-bold text-gray-900 dark:text-gray-100">
                bảo mật tối đa
              </span>{" "}
              và trải nghiệm tốt nhất, vui lòng sử dụng ứng dụng chính thức trên
              thiết bị Android.
            </Text>

            <Box className="py-3 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl inline-flex items-center gap-2 border border-blue-100 dark:border-blue-800/30">
              <Box className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <Text className="text-blue-700 dark:text-blue-300 font-semibold text-sm">
                Ứng dụng "5 Minutes" đã sẵn sàng
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Action Section */}
        <Box className="w-full space-y-3">
          <Button
            fullWidth
            prefixIcon={<Download className="w-5 h-5" />}
            onClick={handleDownloadApp}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 h-14 rounded-2xl text-lg font-bold transition-all active:scale-95 shadow-xl shadow-gray-500/20 dark:shadow-none"
          >
            Tải về ngay
          </Button>

          <Text className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-bold py-4">
            Security Force • Five Minutes
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};

export default AndroidRestrictionModal;
