import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ChevronLeft,
  Phone,
  Camera,
  User,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Files,
  Heart,
  Users,
  ChevronRight,
  Save,
  Calendar,
  LogOut,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSnackbar, Box } from "zmp-ui";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile data state
  const [user, setUser] = useState({
    name: "Nguyễn Văn A",
    role: "Nhân viên chính thức",
    id: "EMP-2024-001",
    department: "Engineering",
    email: "alex.smith@company.com",
    phone: "+84 987 654 321",
    location: "Hanoi Office",
    birthday: "01/01/1995",
    avatar: "https://i.pravatar.cc/300",
  });

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: "Trần Thị B", relationship: "Vợ", phone: "0912345678" },
  ]);

  // Dependents state
  const [dependents, setDependents] = useState([
    { id: 1, name: "Nguyễn Văn C", relationship: "Con trai", birthday: "2020" },
  ]);

  const handleUpdateAvatar = () => {
    openSnackbar({
      type: "info",
      text: "Tính năng tải ảnh đang được phát triển",
      duration: 3000,
    });
  };

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      openSnackbar({
        type: "success",
        text: "Cập nhật thông tin thành công",
        duration: 3000,
      });
    }, 1000);
  };

  const handleLogout = () => {
    navigate("/login");
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
                Thiết lập
              </h1>
              <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest opacity-80">
                Tài khoản
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
      <div className="max-w-2xl mx-auto w-full">
        {/* Profile Header section with Avatar replacement logic */}
        <div className="flex flex-col items-center py-6">
          <div className="relative group">
            <Avatar className="h-28 w-28 border-4 border-white dark:border-[#262A31] shadow-2xl ring-4 ring-emerald-500/10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-emerald-100 text-emerald-600 font-black text-3xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleUpdateAvatar}
              className="absolute bottom-0 right-0 h-9 w-9 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a1d23] shadow-lg hover:bg-emerald-600 transition-colors active:scale-90"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
            {user.name}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
            {user.role}
          </p>
          <div className="mt-2 flex gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
              {user.id}
            </Badge>
            <Badge className="bg-blue-500/10 text-blue-600 border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
              {user.department}
            </Badge>
          </div>
        </div>

        {/* Main Configuration Sections */}
        <div className="space-y-8 pb-4">
          {/* Basic Information */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="h-3 w-3" /> Thông tin cơ bản
              </h3>
            </div>
            <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                      className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={user.phone}
                        onChange={(e) =>
                          setUser({ ...user, phone: e.target.value })
                        }
                        className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="birthday"
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      Ngày sinh
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="birthday"
                        type="text"
                        value={user.birthday}
                        onChange={(e) =>
                          setUser({ ...user, birthday: e.target.value })
                        }
                        className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Documents Section based on profile.dart */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Files className="h-3 w-3" /> Tài liệu hồ sơ
              </h3>
              <Badge
                variant="outline"
                className="rounded-full border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
              >
                5/5 yêu cầu
              </Badge>
            </div>
            <Card className="border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {[
                  {
                    label: "Ảnh thẻ cá nhân",
                    type: "personal_photo",
                    status: "uploaded",
                  },
                  {
                    label: "Bằng cấp chuyên môn",
                    type: "degree_certification",
                    status: "uploaded",
                  },
                  {
                    label: "Căn cước công dân",
                    type: "id_document",
                    status: "uploaded",
                  },
                  {
                    label: "Giấy khám sức khỏe",
                    type: "health_certificate",
                    status: "uploaded",
                  },
                  {
                    label: "CV / Resume",
                    type: "cv_resume",
                    status: "uploaded",
                  },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Files className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                          {doc.label}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                          Đã tải lên: 12/01/2024
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10">
                <Button
                  variant="ghost"
                  className="w-full text-emerald-600 font-black uppercase text-[10px] tracking-[0.2em] gap-2"
                >
                  <Plus className="h-4 w-4" /> Tải lên tài liệu mới
                </Button>
              </div>
            </Card>
          </section>

          {/* Emergency Contacts */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Heart className="h-3 w-3 text-red-400" /> Liên hệ khẩn cấp
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-emerald-600 font-black text-[10px] uppercase tracking-wider"
              >
                <Plus className="h-3 w-3 mr-1" /> Thêm mới
              </Button>
            </div>
            <div className="grid gap-3">
              {emergencyContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="p-4 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {contact.name}
                      </p>
                      <p className="text-[10px] font-bold text-orange-500/80 uppercase tracking-tighter">
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-emerald-500"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Dependents */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="h-3 w-3 text-blue-400" /> Người phụ thuộc
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-emerald-600 font-black text-[10px] uppercase tracking-wider"
              >
                <Plus className="h-3 w-3 mr-1" /> Thêm mới
              </Button>
            </div>
            <div className="grid gap-3">
              {dependents.map((dep) => (
                <Card
                  key={dep.id}
                  className="p-4 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {dep.name}
                      </p>
                      <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-tighter">
                        {dep.relationship} • Sinh năm {dep.birthday}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-emerald-500"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Password Management */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Lock className="h-3 w-3" /> Đổi mật khẩu
              </h3>
            </div>
            <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Mật khẩu hiện tại
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Mật khẩu mới
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Tối thiểu 8 ký tự"
                      className="pl-10 pr-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button className="w-full h-11 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-500/10">
                  Xác nhận đổi mật khẩu
                </Button>
              </div>
            </Card>
          </section>

          {/* System & Logout */}
          <section className="pt-4 space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 justify-between rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#262A31] p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-100 dark:border-red-900/30 group"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <span className="font-bold">Đăng xuất khỏi thiết bị</span>
              </div>
            </Button>
            <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">
              AntiGravity OS • Version 2.0.4
            </p>
          </section>
        </div>
      </div>

      {/* Sticky Save Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-50 pb-safe">
        <Button
          className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98]"
          onClick={handleSaveProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </PageContainer>
  );
}
