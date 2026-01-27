import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSnackbar, Box, Tabs } from "zmp-ui";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import {
  getApiEmployeesMe,
  getApiEmployeesMeEmergencyContacts,
  getApiEmployeesMeDependents,
  postApiEmployeesMeAvatarUpload,
  patchApiEmployeesMe,
} from "@/client/sdk.gen";
import { client } from "@/client/client.gen";
import { authService } from "@/services/auth";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile data state
  const [user, setUser] = useState({
    name: "",
    role: "",
    id: "",
    department: "",
    email: "",
    phone: "",
    location: "",
    birthday: "",
    avatar: "",
  });

  // Original user data to compare changes
  const [originalUser, setOriginalUser] = useState<any>(null);

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  // Dependents state
  const [dependents, setDependents] = useState<any[]>([]);

  const [isFetching, setIsFetching] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setIsFetching(true);
      const [profileRes, contactsRes, dependentsRes] = await Promise.all([
        getApiEmployeesMe(),
        getApiEmployeesMeEmergencyContacts(),
        getApiEmployeesMeDependents(),
      ]);

      if (profileRes.data && profileRes.data.data) {
        const d = profileRes.data.data;
        const mappedUser = {
          name: d.fullName || "",
          role: d.position || "Nhân viên",
          id: d.employeeCode || "",
          department: d.department?.name || "",
          email: (d.workEmail as string) || "",
          phone: d.phone || "",
          location: d.permanentAddress || "",
          birthday: d.birthday
            ? format(new Date(d.birthday), "dd-MM-yyyy")
            : "",
          avatar: d.avatarUrl || "https://i.pravatar.cc/300",
        };
        setUser(mappedUser);
        setOriginalUser(d);
      }

      if (contactsRes.data && contactsRes.data.data) {
        setEmergencyContacts(contactsRes.data.data);
      }

      if (dependentsRes.data && dependentsRes.data.data) {
        setDependents(dependentsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      openSnackbar({
        type: "error",
        text: "Không thể tải thông tin hồ sơ",
        duration: 3000,
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateAvatar = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const res = await postApiEmployeesMeAvatarUpload({
        body: { file },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Cập nhật ảnh đại diện thành công",
        duration: 3000,
      });

      // Refresh user data to get the new avatar URL
      const profileRes = await getApiEmployeesMe();
      if (profileRes.data && profileRes.data.data) {
        const newAvatar = profileRes.data.data.avatarUrl;
        setUser((prev) => ({ ...prev, avatar: newAvatar || prev.avatar }));

        // Cache for dashboard
        if (newAvatar) {
          localStorage.setItem("cached_userAvatar", newAvatar);
        }
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      openSnackbar({
        type: "error",
        text: "Tải ảnh thất bại",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // 1. Update name if changed via Better Auth update-user
      if (user.name !== originalUser?.fullName) {
        const authUpdate = await client.post({
          url: "/api/auth/update-user",
          body: { name: user.name },
        });
        if (authUpdate.error)
          console.warn("Auth name update failed:", authUpdate.error);
        else {
          // Success, update dashboard cache
          localStorage.setItem("cached_userName", user.name);
        }
      }

      // 2. Update contacts and dependents
      // The API patchApiEmployeesMe expects the full list of contacts and dependents
      const res = await patchApiEmployeesMe({
        body: {
          emergencyContacts: emergencyContacts.map((c) => ({
            fullName: c.fullName,
            relationship: c.relationship,
            phone: c.phone,
          })),
          dependents: dependents.map((d) => ({
            fullName: d.fullName,
            relationship: d.relationship,
            birthday: d.birthday,
          })),
        },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Cập nhật thông tin thành công",
        duration: 3000,
      });

      // Refresh data
      await fetchProfile();
    } catch (error) {
      console.error("Failed to save profile:", error);
      openSnackbar({
        type: "error",
        text: "Cập nhật thất bại",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      openSnackbar({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 8 ký tự",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await client.post({
        url: "/api/auth/change-password",
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
        duration: 3000,
      });

      // Better Auth redirects or requires re-login after password change
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to change password:", error);
      openSnackbar({
        type: "error",
        text: error?.message || "Đổi mật khẩu thất bại",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <PageContainer
      header={
        <CustomPageHeader
          title="Thiết lập"
          subtitle="Tài khoản"
          user={{
            name: user.name,
            avatar: user.avatar,
          }}
          onBack={() => navigate(-1)}
          variant="orange"
        />
      }
    >
      <div className="max-w-2xl mx-auto w-full">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400">
              Đang tải hồ sơ...
            </p>
          </div>
        ) : (
          <Box className="pb-16">
            {/* Profile Header section with Avatar replacement logic */}
            <div className="relative overflow-hidden bg-gradient-to-b from-orange-500/10 to-transparent pb-8 pt-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-white dark:border-[#262A31] shadow-2xl ring-4 ring-orange-500/10 scale-100 group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-orange-100 text-orange-600 font-black text-3xl">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleUpdateAvatar}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 h-9 w-9 bg-orange-600 text-white rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a1d23] shadow-lg hover:bg-orange-700 transition-all active:scale-90 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </div>
                <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-sm font-bold text-orange-600/80 dark:text-orange-400/80 capitalize tracking-tight">
                  {user.role}
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge className="bg-orange-500/10 text-orange-700 border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    {user.id}
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-600 border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    {user.department}
                  </Badge>
                </div>
              </div>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              className="w-full zaui-tabs-custom"
            >
              {/* Profile Tab */}
              <Tabs.Tab
                key="profile"
                label={
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>Hồ sơ</span>
                  </div>
                }
              >
                <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 px-1">
                  {/* Basic Information */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Thông tin cơ bản
                      </h3>
                    </div>
                    <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl space-y-4">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Họ và tên
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              value={user.name}
                              onChange={(e) =>
                                setUser({ ...user, name: e.target.value })
                              }
                              className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Số điện thoại
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                value={user.phone}
                                onChange={(e) =>
                                  setUser({ ...user, phone: e.target.value })
                                }
                                className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Ngày sinh
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                type="text"
                                value={user.birthday}
                                onChange={(e) =>
                                  setUser({ ...user, birthday: e.target.value })
                                }
                                className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </section>

                  {/* Documents Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Tài liệu hồ sơ
                      </h3>
                      <Badge className="bg-orange-500/10 text-orange-600 border-none rounded-full px-3 py-1 text-[10px] font-black">
                        5/5 Yêu cầu
                      </Badge>
                    </div>
                    <Card className="border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl overflow-hidden">
                      <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {[
                          { label: "Ảnh thẻ cá nhân", status: "uploaded" },
                          { label: "Bằng cấp chuyên môn", status: "uploaded" },
                          { label: "Căn cước công dân", status: "uploaded" },
                          { label: "Giấy khám sức khỏe", status: "uploaded" },
                          { label: "CV / Resume", status: "uploaded" },
                        ].map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <Files className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                                  {doc.label}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase">
                                  Đã tải lên •{" "}
                                  {format(new Date(), "dd-MM-yyyy")}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20">
                        <Button
                          variant="ghost"
                          className="w-full text-orange-600 font-black uppercase text-[10px] tracking-[0.2em] gap-2"
                        >
                          <Plus className="h-4 w-4" /> Tải lên tài liệu mới
                        </Button>
                      </div>
                    </Card>
                  </section>
                </div>
              </Tabs.Tab>

              {/* Family Tab */}
              <Tabs.Tab
                key="family"
                label={
                  <div className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5" />
                    <span>Gia đình</span>
                  </div>
                }
              >
                <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 px-1">
                  {/* Emergency Contacts */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Liên hệ khẩn cấp
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full text-orange-600 font-black text-[10px] uppercase tracking-wider"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Thêm mới
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {emergencyContacts.length > 0 ? (
                        emergencyContacts.map((contact, idx) => (
                          <Card
                            key={contact.id || idx}
                            className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shadow-inner">
                                <Phone className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                  {contact.fullName || contact.name}
                                </p>
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tight mt-0.5">
                                  {contact.relationship} • {contact.phone}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Chưa có thông tin liên hệ
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Dependents */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Người phụ thuộc
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full text-blue-600 font-black text-[10px] uppercase tracking-wider"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Thêm mới
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {dependents.length > 0 ? (
                        dependents.map((dep, idx) => (
                          <Card
                            key={dep.id || idx}
                            className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shadow-inner">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                  {dep.fullName || dep.name}
                                </p>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight mt-0.5">
                                  {dep.relationship}{" "}
                                  {dep.birthday
                                    ? `• Sinh năm ${new Date(dep.birthday).getFullYear()}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Chưa có thông tin người thân
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </Tabs.Tab>

              {/* Security Tab */}
              <Tabs.Tab
                key="security"
                label={
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Bảo mật</span>
                  </div>
                }
              >
                <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 px-1">
                  {/* Password Management */}
                  <section className="space-y-4">
                    <div className="px-1 text-center py-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 mb-6">
                      <Lock className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Đổi mật khẩu
                      </h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] mx-auto">
                        Mật khẩu nên có ít nhất 8 ký tự bao gồm chữ cái và số.
                      </p>
                    </div>

                    <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Mật khẩu mới
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Tối thiểu 8 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-orange-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <Button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-slate-900 dark:bg-orange-600 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-500/10 hover:bg-slate-800 transition-all active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Cập nhật mật khẩu"
                        )}
                      </Button>
                    </Card>
                  </section>

                  {/* System & Logout */}
                  <section className="pt-4 space-y-4">
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-between rounded-2xl border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 group transition-all"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">
                          Đăng xuất khỏi thiết bị
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Button>
                  </section>
                </div>
              </Tabs.Tab>
            </Tabs>
          </Box>
        )}
      </div>

      {/* Sticky Save Footer */}
      {!isFetching && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23]/80 backdrop-blur-xl z-50 pb-safe">
          <Button
            className="w-full h-14 rounded-2xl bg-orange-600 text-white font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3 hover:bg-orange-700 transition-all active:scale-[0.98]"
            onClick={handleSaveProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Lưu tất cả thay đổi
              </>
            )}
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
