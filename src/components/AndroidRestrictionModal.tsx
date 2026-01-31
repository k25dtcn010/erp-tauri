import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "zmp-ui";
import { AlertCircle, Download, ShieldAlert } from "lucide-react";
import { getSystemInfo } from "zmp-sdk";
import { useAppConfigStore } from "@/store/config-store";

const AndroidRestrictionModal: React.FC = () => {
  const { features, androidAppLink } = useAppConfigStore();
  const [shouldShow, setShouldShow] = React.useState(false);

  React.useEffect(() => {
    try {
      const info = getSystemInfo();
      // Hiện modal nếu: Tính năng chặn đang bật VÀ thiết bị là Android
      if (features.enableAndroidRestriction && info.platform === "android") {
        setShouldShow(true);
      } else {
        setShouldShow(false);
      }
    } catch (error) {
      console.error("Failed to check system info:", error);
    }
  }, [features.enableAndroidRestriction]);

  const handleDownloadApp = () => {
    if (androidAppLink) {
      window.open(androidAppLink, "_blank");
    }
  };

  return (
    <Dialog open={shouldShow}>
      <DialogContent
        hideClose={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-[340px] p-0 overflow-hidden border-none"
      >
        <div className="bg-white p-8 flex flex-col items-center text-center">
          {/* Animated Security Icon Section */}
          <div className="relative mb-8 mt-2">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-red-500/10 animate-ping rounded-full" />
              <div className="relative z-10 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-red-100">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
              <AlertCircle className="w-3 h-3" />
            </div>
          </div>

          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-black text-slate-900 leading-tight">
              Oops! <span className="text-red-500">Android</span> được hỗ trợ qua App
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
              Để đảm bảo <span className="font-bold text-slate-900">bảo mật tối đa</span> và trải nghiệm tốt nhất, vui lòng sử dụng ứng dụng chính thức.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mt-8">
            <Button
              fullWidth
              prefixIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadApp}
              className="h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all"
            >
              Tải ứng dụng ngay
            </Button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
              Security Force • Five Minutes
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AndroidRestrictionModal;
