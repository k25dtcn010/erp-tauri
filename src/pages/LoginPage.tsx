import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Lock, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

// Mock Interfaces matching Dart logic
interface UserCompany {
  id: string;
  name: string;
  isPrimary: boolean;
  employeeName: string;
  avatarUrl?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"username" | "company" | "password">(
    "username",
  );
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Data State
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<UserCompany | null>(
    null,
  );
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Mock API Logic
  const fetchCompanies = async (usernameInput: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response
    if (
      usernameInput.toLowerCase() === "admin" ||
      usernameInput.toLowerCase() === "user"
    ) {
      return [
        {
          id: "comp1",
          name: "Acme Corp Global",
          isPrimary: true,
          employeeName: "Alex Smith",
          avatarUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAx4va01cTU2WHiCjIE09WZBoZoD4YwYPBmPAu0lL8MEf3YqwUDmzHwK--ugZqAK4ipsuZY-IxiAN8unO7T57f1PziQ09VAnXZAq0zpwMsDymtynZ65S5i50pCzw_t4rWpf9Rqh4XQqmp3OLyAnayeL2oG1wVGkBzgZloXj9_R8b11dpXwZc5ST5aVsGYzMDAy4u16JwwCSxjIruWHNjs45HJVrxlN4r1AOx357hp1VlvqbG_00UQwNkckvS2Q4G75HfMlAJJEK-C4y",
        },
        // Uncomment to test multiple companies flow
        /* 
        {
          id: "comp2",
          name: "Acme Corp Asia",
          isPrimary: false,
          employeeName: "Alex Smith",
        } 
        */
      ];
    }
    return [];
  };

  const handleUsernameSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchCompanies(username);

      if (result.length === 0) {
        toast.error("Không tìm thấy người dùng");
        setLoading(false);
        return;
      }

      setCompanies(result);
      const firstCompany = result[0];
      setEmployeeName(firstCompany.employeeName);
      setAvatarUrl(firstCompany.avatarUrl);

      if (result.length === 1) {
        setSelectedCompany(result[0]);
        setStep("password");
      } else {
        // Multi-company logic
        setStep("company");
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: UserCompany) => {
    setSelectedCompany(company);
    setStep("password");
  };

  const handleLogin = async (currentPassword?: string) => {
    const passToCheck = currentPassword || password; // Use passed value or state
    if (passToCheck.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // Mock Login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (passToCheck === "123456") {
        toast.success("Đăng nhập thành công");
        navigate("/");
      } else {
        toast.error("Mật khẩu không đúng");
        setPassword("");
        // Optional: focus back? InputOTP handles focus well usually.
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("username");
    setPassword("");
    setCompanies([]);
    setSelectedCompany(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-[#1a1d23] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply opacity-50 dark:opacity-20" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply opacity-50 dark:opacity-20" />

      <div className="w-full max-w-md bg-white dark:bg-[#1a1d23] rounded-[32px] shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-500 relative z-10">
        {/* Header / Loading Bar */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-white/5 overflow-hidden">
            <div className="h-full bg-amber-400 animate-progress origin-left" />
          </div>
        )}

        <div className="p-8 pb-10">
          {/* Back Button */}
          {step !== "username" && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="absolute top-8 left-8 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Icon Header */}
          <div className="flex justify-center mb-8 pt-4">
            <div className="w-20 h-20 rounded-[28px] bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-amber-400/20 rounded-[28px] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
              <Lock className="w-10 h-10 text-amber-500 dark:text-amber-400 relative z-10" />
            </div>
          </div>

          {/* Text Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {step === "username" && "Đăng Nhập"}
              {step === "company" && "Chọn Công Ty"}
              {step === "password" && "Nhập Mã PIN"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {step === "username" && "Nhập tên người dùng để tiếp tục"}
              {step === "company" && "Chọn nơi bạn muốn truy cập"}
              {step === "password" && "Nhập mã bảo mật 6 số của bạn"}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* User Summary Card (When not in username step) */}
            {step !== "username" && employeeName && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <Avatar className="h-12 w-12 border-2 border-white dark:border-[#262A31] shadow-sm">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">
                    {employeeName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {employeeName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {selectedCompany ? selectedCompany.name : username}
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Username Input */}
            {step === "username" && (
              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Tên đăng nhập / Email"
                      className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 rounded-xl transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading || !username}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Tiếp Tục"
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Company Selection */}
            {step === "company" && companies.length > 0 && (
              <div className="space-y-3">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full p-4 flex items-center gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-400/10 hover:border-amber-200 dark:hover:border-amber-400/30 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-400/20 transition-colors">
                      <Building2 className="w-5 h-5 text-gray-500 group-hover:text-amber-600 dark:text-gray-400 dark:group-hover:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-500">Nhấn để chọn</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Password / OTP */}
            {step === "password" && (
              <div className="space-y-8 flex flex-col items-center">
                <div className="relative w-full flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={password}
                    onChange={(val) => {
                      setPassword(val);
                      if (val.length === 6) {
                        handleLogin(val);
                      }
                    }}
                    disabled={loading}
                    className="gap-2 w-full"
                    containerClassName="w-full"
                  >
                    <InputOTPGroup className="gap-2 sm:gap-3 w-full">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="flex-1 h-14 sm:h-16 text-2xl font-black bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl data-[active=true]:ring-2 data-[active=true]:ring-amber-400/50 data-[active=true]:border-amber-400 transition-all"
                          // Privacy masking styling
                          style={{ WebkitTextSecurity: "disc" } as any}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={() => handleLogin()}
                  className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading || password.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Đăng Nhập"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-white/5 p-4 text-center border-t border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-500 font-medium">
            © 2026 TimeKeeping App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
