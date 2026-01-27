import React from "react";
import { Box, useNavigate } from "zmp-ui";
import { Construction, Home, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";

const UnderDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      header={
        <CustomPageHeader
          title="Tính năng"
          subtitle="Sắp ra mắt"
          onBack={() => navigate(-1)}
          variant="orange"
        />
      }
    >
      <Box
        flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        className="h-full px-6 text-center"
      >
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-12 w-12 text-orange-500 animate-bounce" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          Tính năng đang phát triển
        </h1>

        <p className="text-slate-500 dark:text-gray-400 font-medium mb-10 max-w-[280px]">
          Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm
          tốt nhất cho bạn. Vui lòng quay lại sau!
        </p>

        <div className="flex flex-col w-full gap-3">
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none h-12 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center gap-2 border-gray-200 dark:border-white/10"
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
