import React, { useEffect } from "react";
import { Box, useNavigate } from "zmp-ui";
import { Construction, Home, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";

const UnderDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { userName, fetchUser } = useUserStore();

  useEffect(() => {
    if (!userName) {
      fetchUser();
    }
  }, [userName, fetchUser]);

  const CustomHeader = (
    <CustomPageHeader
      title="Tính Năng"
      subtitle="Sắp Ra Mắt"
      onBack={() => navigate(-1)}
      variant="orange"
    />
  );

  return (
    <PageContainer header={CustomHeader}>
      <Box
        flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        className="h-full px-6 text-center"
      >
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-orange-200/50 dark:bg-orange-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-70" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/5 rounded-full flex items-center justify-center border border-orange-200/50 dark:border-orange-500/20 shadow-inner">
            <Construction className="h-14 w-14 text-orange-500 group-hover:scale-110 transition-transform duration-500 ease-out animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">
          Tính năng
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
            Đang phát triển
          </span>
        </h1>

        <p className="text-slate-500 dark:text-gray-400 font-medium mb-12 max-w-[280px] leading-relaxed">
          Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm
          tốt nhất cho bạn.
        </p>

        <div className="flex flex-col w-full gap-3 max-w-sm">
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </Box>
    </PageContainer>
  );
};

export default UnderDevelopmentPage;
