import React from "react";
import { Box, Text, useNavigate } from "zmp-ui";
import { Construction, ChevronLeft, Bell, Home, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UnderDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();

  // Temporary mock user for header consistency
  const user = {
    name: "User",
    avatar: "",
  };

  return (
    <PageContainer
      header={
        <div className="flex items-center justify-between w-full px-4 py-2">
          <div className="w-16 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 shrink-0"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-6 w-6 text-orange-500" />
            </Button>
          </div>

          <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-white/5 pl-1 pr-3 py-1 rounded-2xl border border-gray-100 dark:border-white/5 shrink-0 shadow-sm">
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-[10px]">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800" />
            </div>

            <div className="flex flex-col min-w-[80px]">
              <h1 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                Tính năng
              </h1>
              <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest opacity-80">
                Sắp ra mắt
              </p>
            </div>

            <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 relative shrink-0"
            >
              <Bell className="h-3.5 w-3.5 text-gray-500" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full border border-white dark:border-[#1a1d23]" />
            </Button>
          </div>

          <div className="w-16 shrink-0" />
        </div>
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
          Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau!
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
