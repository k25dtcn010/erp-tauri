import React from "react";
import { Page, Header, useNavigate, Box, Text, Button } from "zmp-ui";
import { Construction, ArrowLeft, Home } from "lucide-react";

const UnderDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page className="bg-white dark:bg-[#1a1d23]">
      <Header 
        showBackIcon={true} 
        onBackClick={() => navigate(-1)}
        title="Đang phát triển" 
      />
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
          Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau!
        </p>

        <div className="flex flex-col w-full gap-3">
          <Button 
            fullWidth 
            onClick={() => navigate("/")}
            variant="primary"
            className="bg-emerald-500 border-none h-12 rounded-2xl font-black uppercase tracking-widest text-[12px]"
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Về trang chủ
            </div>
          </Button>
          
          <Button 
            fullWidth 
            onClick={() => navigate(-1)}
            variant="secondary"
            type="neutral"
            className="h-12 rounded-2xl font-black uppercase tracking-widest text-[12px]"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </div>
          </Button>
        </div>
      </Box>
    </Page>
  );
};

export default UnderDevelopmentPage;
