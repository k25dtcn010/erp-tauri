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
  XCircle,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSnackbar,
  Box,
  Tabs,
  Sheet,
  Select as ZSelect,
  Input as ZInput,
} from "zmp-ui";
import { DatePicker } from "@/components/ui/date-picker";
import { parse } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
const { Option } = ZSelect;
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import {
  patchApiEmployeesMe,
  getApiEmployeesMe,
  getApiEmployeesMeEmergencyContacts,
  getApiEmployeesMeDependents,
  postApiEmployeesMeAvatarUpload,
  getApiEmployeesByEmployeeIdDocuments,
  postApiEmployeesByEmployeeIdDocuments,
  deleteApiEmployeesByEmployeeIdDocumentsByDocumentId,
  postApiEmployeesMeEmergencyContacts,
  putApiEmployeesMeEmergencyContactsContactId,
  deleteApiEmployeesMeEmergencyContactsContactId,
  postApiEmployeesMeDependents,
  putApiEmployeesMeDependentsDependentId,
  deleteApiEmployeesMeDependentsDependentId,
  getApiEmployeesEmployeesByEmployeeIdBankAccounts,
  postApiEmployeesEmployeesByEmployeeIdBankAccounts,
  putApiEmployeesEmployeesByEmployeeIdBankAccountsByAccountId,
  deleteApiEmployeesEmployeesByEmployeeIdBankAccountsByAccountId,
} from "@/client/sdk.gen";
import { client } from "@/client/client.gen";
import { authService } from "@/services/auth";
import { useAppConfigStore } from "@/store/config-store";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { features } = useAppConfigStore();

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
    height: "",
    weight: "",
    bloodType: "",
    healthNotes: "",
  });

  // Original user data to compare changes
  const [originalUser, setOriginalUser] = useState<any>(null);

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  // Dependents state
  const [dependents, setDependents] = useState<any[]>([]);
  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // States for Add/Edit Modals
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [isDependentSheetOpen, setIsDependentSheetOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingDependentId, setEditingDependentId] = useState<string | null>(
    null,
  );
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [editingBankAccountId, setEditingBankAccountId] = useState<
    string | null
  >(null);

  const [contactForm, setContactForm] = useState({
    fullName: "",
    relationship: "",
    phone: "",
    notes: "",
  });

  const [dependentForm, setDependentForm] = useState({
    fullName: "",
    relationship: "",
    birthday: "",
    address: "",
    notes: "",
  });

  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchName: "",
    isDefault: true,
    notes: "",
  });

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
          height: d.height?.toString() || "",
          weight: d.weight?.toString() || "",
          bloodType: d.bloodType || "",
          healthNotes: d.healthNotes || "",
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

      // Fetch documents using employee ID from profile
      if (profileRes.data?.data?.id) {
        const docsRes = await getApiEmployeesByEmployeeIdDocuments({
          path: { employeeId: profileRes.data.data.id },
        });
        if (docsRes.data && docsRes.data.data) {
          setDocuments(docsRes.data.data);
        }

        // Fetch bank accounts
        const bankRes = await getApiEmployeesEmployeesByEmployeeIdBankAccounts({
          path: { employeeId: profileRes.data.data.id },
        });
        if (bankRes.data && bankRes.data.data) {
          setBankAccounts(bankRes.data.data);
        }
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

  const handleUploadDocument = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !originalUser?.id) return;

    try {
      setIsLoading(true);
      setUploadingDocType(docType);

      const res = await postApiEmployeesByEmployeeIdDocuments({
        path: { employeeId: originalUser.id },
        body: {
          file,
          document_type: docType,
        },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Tải lên tài liệu thành công",
        duration: 3000,
      });

      // Refresh documents
      const docsRes = await getApiEmployeesByEmployeeIdDocuments({
        path: { employeeId: originalUser.id },
      });
      if (docsRes.data && docsRes.data.data) {
        setDocuments(docsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      openSnackbar({
        type: "error",
        text: "Tải lên thất bại",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setUploadingDocType(null);
      if (docFileInputRef.current) docFileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!originalUser?.id) return;

    try {
      setIsLoading(true);
      const res = await deleteApiEmployeesByEmployeeIdDocumentsByDocumentId({
        path: {
          employeeId: originalUser.id,
          documentId: documentId,
        },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Đã xóa tài liệu",
        duration: 3000,
      });

      // Refresh documents
      const docsRes = await getApiEmployeesByEmployeeIdDocuments({
        path: { employeeId: originalUser.id },
      });
      if (docsRes.data && docsRes.data.data) {
        setDocuments(docsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      openSnackbar({
        type: "error",
        text: "Xóa thất bại",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const phoneRegex = /^0\d{9,10}$/;
    if (user.phone && !phoneRegex.test(user.phone)) {
      openSnackbar({
        type: "error",
        text: "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)",
        duration: 3000,
      });
      return;
    }

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

      // 2. Profile other fields
      // Cập nhật thông tin sức khỏe và các thông tin cá nhân khác
      const profileUpdate = await patchApiEmployeesMe({
        body: {
          phone: user.phone,
          // Chuyển đổi định dạng ngày sinh nếu cần (dd-mm-yyyy -> yyyy-mm-dd)
          birthday: user.birthday ? user.birthday.split("-").reverse().join("-") : null,
          height: user.height ? Number(user.height) : null,
          weight: user.weight ? Number(user.weight) : null,
          bloodType: user.bloodType,
          healthNotes: user.healthNotes,
        },
      });

      if (profileUpdate.error) {
        throw new Error("Không thể cập nhật thông tin hồ sơ");
      }

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

  // Emergency Contacts Handlers
  const handleAddContact = () => {
    setContactForm({ fullName: "", relationship: "", phone: "", notes: "" });
    setEditingContactId(null);
    setIsContactSheetOpen(true);
  };

  const handleEditContact = (contact: any) => {
    setContactForm({
      fullName: contact.fullName || contact.name || "",
      relationship: contact.relationship || "",
      phone: contact.phone || "",
      notes: contact.notes || "",
    });
    setEditingContactId(contact.id);
    setIsContactSheetOpen(true);
  };

  const handleDeleteContact = async (id: string | undefined) => {
    if (!id || id.startsWith("new-")) {
      setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
      return;
    }

    try {
      setIsLoading(true);
      const res = await deleteApiEmployeesMeEmergencyContactsContactId({
        path: { contactId: id },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Đã xóa liên hệ khẩn cấp",
        duration: 3000,
      });

      await fetchProfile();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      openSnackbar({
        type: "error",
        text: "Không thể xóa liên hệ",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async () => {
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(contactForm.phone)) {
      openSnackbar({
        type: "error",
        text: "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      if (editingContactId && !editingContactId.startsWith("new-")) {
        const res = await putApiEmployeesMeEmergencyContactsContactId({
          path: { contactId: editingContactId },
          body: {
            fullName: contactForm.fullName,
            relationship: contactForm.relationship,
            phone: contactForm.phone,
            notes: contactForm.notes,
          },
        });
        if (res.error) throw res.error;
      } else {
        const res = await postApiEmployeesMeEmergencyContacts({
          body: {
            fullName: contactForm.fullName,
            relationship: contactForm.relationship,
            phone: contactForm.phone,
            notes: contactForm.notes,
          },
        });
        if (res.error) throw res.error;
      }

      openSnackbar({
        type: "success",
        text: editingContactId ? "Đã cập nhật liên hệ" : "Đã thêm liên hệ mới",
        duration: 3000,
      });

      setIsContactSheetOpen(false);
      await fetchProfile();
    } catch (error) {
      console.error("Failed to save contact:", error);
      openSnackbar({
        type: "error",
        text: "Không thể lưu thông tin liên hệ",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dependents Handlers
  const handleAddDependent = () => {
    setDependentForm({
      fullName: "",
      relationship: "",
      birthday: "",
      address: "",
      notes: "",
    });
    setEditingDependentId(null);
    setIsDependentSheetOpen(true);
  };

  const handleEditDependent = (dep: any) => {
    setDependentForm({
      fullName: dep.fullName || dep.name || "",
      relationship: dep.relationship || "",
      birthday: dep.birthday || "",
      address: dep.address || "",
      notes: dep.notes || "",
    });
    setEditingDependentId(dep.id);
    setIsDependentSheetOpen(true);
  };

  const handleDeleteDependent = async (id: string | undefined) => {
    if (!id || id.startsWith("new-")) {
      setDependents((prev) => prev.filter((d) => d.id !== id));
      return;
    }

    try {
      setIsLoading(true);
      const res = await deleteApiEmployeesMeDependentsDependentId({
        path: { dependentId: id },
      });

      if (res.error) throw res.error;

      openSnackbar({
        type: "success",
        text: "Đã xóa người phụ thuộc",
        duration: 3000,
      });

      await fetchProfile();
    } catch (error) {
      console.error("Failed to delete dependent:", error);
      openSnackbar({
        type: "error",
        text: "Không thể xóa thông tin",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDependent = async () => {
    if (!dependentForm.fullName || !dependentForm.relationship) {
      openSnackbar({
        type: "error",
        text: "Vui lòng điền họ tên và mối quan hệ",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      if (editingDependentId && !editingDependentId.startsWith("new-")) {
        const res = await putApiEmployeesMeDependentsDependentId({
          path: { dependentId: editingDependentId },
          body: {
            fullName: dependentForm.fullName,
            relationship: dependentForm.relationship,
            birthday: dependentForm.birthday,
            address: dependentForm.address,
            notes: dependentForm.notes,
          },
        });
        if (res.error) throw res.error;
      } else {
        const res = await postApiEmployeesMeDependents({
          body: {
            fullName: dependentForm.fullName,
            relationship: dependentForm.relationship,
            birthday: dependentForm.birthday,
            address: dependentForm.address,
            notes: dependentForm.notes,
          },
        });
        if (res.error) throw res.error;
      }

      openSnackbar({
        type: "success",
        text: editingDependentId
          ? "Đã cập nhật thông tin"
          : "Đã thêm người phụ thuộc",
        duration: 3000,
      });

      setIsDependentSheetOpen(false);
      await fetchProfile();
    } catch (error) {
      console.error("Failed to save dependent:", error);
      openSnackbar({
        type: "error",
        text: "Không thể lưu thông tin người thân",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Bank Accounts Handlers
  const handleAddBankAccount = () => {
    setBankForm({
      bankName: "",
      accountNumber: "",
      accountHolderName: user.name.toUpperCase(),
      branchName: "",
      isDefault: bankAccounts.length === 0,
      notes: "",
    });
    setEditingBankAccountId(null);
    setIsBankSheetOpen(true);
  };

  const handleEditBankAccount = (bank: any) => {
    setBankForm({
      bankName: bank.bankName || "",
      accountNumber: bank.accountNumber || "",
      accountHolderName: bank.accountHolderName || "",
      branchName: bank.branchName || "",
      isDefault: bank.isDefault || false,
      notes: bank.notes || "",
    });
    setEditingBankAccountId(bank.id);
    setIsBankSheetOpen(true);
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (!originalUser?.id) return;
    try {
      setIsLoading(true);
      const res =
        await deleteApiEmployeesEmployeesByEmployeeIdBankAccountsByAccountId({
          path: { employeeId: originalUser.id, accountId: id },
        });
      if (res.error) throw res.error;
      openSnackbar({
        type: "success",
        text: "Đã xóa tài khoản ngân hàng",
        duration: 3000,
      });
      await fetchProfile();
    } catch (error) {
      console.error("Failed to delete bank account:", error);
      openSnackbar({
        type: "error",
        text: "Không thể xóa tài khoản",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBankAccount = async () => {
    if (!originalUser?.id) return;
    if (!bankForm.bankName || !bankForm.accountNumber) {
      openSnackbar({
        type: "error",
        text: "Vui lòng điền tên ngân hàng và số tài khoản",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      if (editingBankAccountId) {
        const res =
          await putApiEmployeesEmployeesByEmployeeIdBankAccountsByAccountId({
            path: {
              employeeId: originalUser.id,
              accountId: editingBankAccountId,
            },
            body: bankForm,
          });
        if (res.error) throw res.error;
      } else {
        const res = await postApiEmployeesEmployeesByEmployeeIdBankAccounts({
          path: { employeeId: originalUser.id },
          body: bankForm,
        });
        if (res.error) throw res.error;
      }

      openSnackbar({
        type: "success",
        text: editingBankAccountId
          ? "Đã cập nhật tài khoản"
          : "Đã thêm tài khoản mới",
        duration: 3000,
      });
      setIsBankSheetOpen(false);
      await fetchProfile();
    } catch (error) {
      console.error("Failed to save bank account:", error);
      openSnackbar({
        type: "error",
        text: "Không thể lưu thông tin ngân hàng",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
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
          <Box>
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
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  if (val.length <= 11) {
                                    setUser({ ...user, phone: val });
                                  }
                                }}
                                className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                                placeholder="090..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Ngày sinh
                            </Label>
                            <DatePicker
                              date={
                                user.birthday
                                  ? parse(user.birthday, "dd-MM-yyyy", new Date())
                                  : undefined
                              }
                              setDate={(date) =>
                                setUser({
                                  ...user,
                                  birthday: date ? format(date, "dd-MM-yyyy") : "",
                                })
                              }
                              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </section>

                  {/* Bank Information Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Thông tin ngân hàng
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full text-orange-600 font-black text-[10px] uppercase tracking-wider"
                        onClick={handleAddBankAccount}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Thêm mới
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {bankAccounts.length > 0 ? (
                        bankAccounts.map((bank, idx) => (
                          <Card
                            key={bank.id || idx}
                            className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shadow-inner">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {bank.bankName}
                                  </p>
                                  {bank.isDefault && (
                                    <Badge className="bg-orange-500/10 text-orange-600 border-none rounded-full px-2 py-0.5 text-[8px] font-black uppercase">
                                      Mặc định
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tight mt-0.5">
                                  {bank.accountNumber} •{" "}
                                  {bank.accountHolderName}
                                </p>
                                {bank.branchName && (
                                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                                    Chi nhánh: {bank.branchName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                onClick={() => handleEditBankAccount(bank)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => handleDeleteBankAccount(bank.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Chưa có tài khoản ngân hàng
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Documents Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Tài liệu hồ sơ
                      </h3>
                      <Badge className="bg-orange-500/10 text-orange-600 border-none rounded-full px-3 py-1 text-[10px] font-black">
                        {
                          [
                            "personal_photo",
                            "degree_certification",
                            "identity_card_front",
                            "identity_card_back",
                            "health_certificate",
                            "cv_resume",
                          ].filter((type) =>
                            documents.some((d) => d.documentType === type),
                          ).length
                        }
                        /6 Yêu cầu
                      </Badge>
                    </div>
                    <Card className="border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl overflow-hidden">
                      <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {[
                          {
                            type: "personal_photo",
                            label: "Ảnh thẻ cá nhân",
                          },
                          {
                            type: "degree_certification",
                            label: "Bằng cấp chuyên môn",
                          },
                          {
                            type: "identity_card_front",
                            label: "CCCD mặt trước",
                          },
                          {
                            type: "identity_card_back",
                            label: "CCCD mặt sau",
                          },
                          {
                            type: "health_certificate",
                            label: "Giấy khám sức khỏe",
                          },
                          {
                            type: "cv_resume",
                            label: "CV / Resume",
                          },
                        ].map((docType, idx) => {
                          const docsOfType = documents.filter(
                            (d) => d.documentType === docType.type,
                          );
                          const hasDoc = docsOfType.length > 0;

                          return (
                            <div key={idx} className="flex flex-col">
                              <div
                                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                                onClick={() => {
                                  if (hasDoc) {
                                    // Basic toggle or view logic could go here
                                    // For now, let's just open the first one if there is only one
                                    if (docsOfType.length === 1) {
                                      window.open(
                                        docsOfType[0].fileUrl,
                                        "_blank",
                                      );
                                    }
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                      hasDoc
                                        ? "bg-orange-500/10 text-orange-600"
                                        : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                                    )}
                                  >
                                    <Files className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                                      {docType.label}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase">
                                      {hasDoc ? (
                                        <>
                                          Đã tải lên •{" "}
                                          {docsOfType.length > 1
                                            ? `${docsOfType.length} tệp`
                                            : format(
                                                new Date(
                                                  docsOfType[0].uploadedAt,
                                                ),
                                                "dd-MM-yyyy",
                                              )}
                                        </>
                                      ) : (
                                        "Chưa tải lên"
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasDoc && (
                                    <Badge className="bg-green-500/10 text-green-600 border-none rounded-full px-2 py-0.5 text-[8px] font-black uppercase">
                                      Done
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUploadingDocType(docType.type);
                                      docFileInputRef.current?.click();
                                    }}
                                    disabled={isLoading}
                                  >
                                    {uploadingDocType === docType.type ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                </div>
                              </div>
                              {hasDoc && (
                                <div className="px-14 pb-4 pt-1 space-y-2">
                                  {docsOfType.map((doc, dIdx) => (
                                    <div
                                      key={dIdx}
                                      className="flex items-center justify-between group/item"
                                    >
                                      <div
                                        className="flex flex-col cursor-pointer hover:text-orange-600 transition-colors"
                                        onClick={() =>
                                          window.open(doc.fileUrl, "_blank")
                                        }
                                      >
                                        <span className="text-[11px] font-bold truncate max-w-[150px]">
                                          {doc.originalFilename}
                                        </span>
                                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                                          {format(
                                            new Date(doc.uploadedAt),
                                            "dd-MM-yyyy HH:mm",
                                          )}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteDocument(doc.id);
                                        }}
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20">
                        <Button
                          variant="ghost"
                          className="w-full text-orange-600 font-black uppercase text-[10px] tracking-[0.2em] gap-2"
                          onClick={() => {
                            // Default to some type if clicked? Or just show a message?
                            // Actually, let's just make it focus an existing type or something.
                            // For now, let's map it to open the first type that's not uploaded.
                            const firstMissing = [
                              "personal_photo",
                              "degree_certification",
                              "identity_card_front",
                              "identity_card_back",
                              "health_certificate",
                              "cv_resume",
                            ].find(
                              (t) =>
                                !documents.some((d) => d.documentType === t),
                            );
                            if (firstMissing) {
                              setUploadingDocType(firstMissing);
                              docFileInputRef.current?.click();
                            } else {
                              setUploadingDocType("cv_resume");
                              docFileInputRef.current?.click();
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" /> Tải lên tài liệu mới
                        </Button>
                        <input
                          type="file"
                          ref={docFileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (uploadingDocType) {
                              handleUploadDocument(e, uploadingDocType);
                            }
                          }}
                        />
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
                        onClick={handleAddContact}
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
                                onClick={() => handleEditContact(contact)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => handleDeleteContact(contact.id)}
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
                        onClick={handleAddDependent}
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
                                onClick={() => handleEditDependent(dep)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => handleDeleteDependent(dep.id)}
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

              {/* Health Tab */}
              <Tabs.Tab
                key="health"
                label={
                  <div className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    <span>Sức khỏe</span>
                  </div>
                }
              >
                <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 px-1">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Thông tin sức khỏe
                      </h3>
                    </div>
                    <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Chiều cao (cm)
                          </Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={user.height}
                              onChange={(e) =>
                                setUser({ ...user, height: e.target.value })
                              }
                              placeholder="170"
                              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Cân nặng (kg)
                          </Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={user.weight}
                              onChange={(e) =>
                                setUser({ ...user, weight: e.target.value })
                              }
                              placeholder="65"
                              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Nhóm máu
                        </Label>
                        <ZSelect
                          placeholder="Chọn nhóm máu"
                          value={user.bloodType}
                          onChange={(val) =>
                            setUser({ ...user, bloodType: val as string })
                          }
                          closeOnSelect
                          mask
                          className="h-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                        >
                          <Option value="A" title="Nhóm máu A" />
                          <Option value="B" title="Nhóm máu B" />
                          <Option value="AB" title="Nhóm máu AB" />
                          <Option value="O" title="Nhóm máu O" />
                        </ZSelect>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Ghi chú sức khỏe
                        </Label>
                        <Textarea
                          value={user.healthNotes}
                          onChange={(e) =>
                            setUser({ ...user, healthNotes: e.target.value })
                          }
                          placeholder="Tiền sử bệnh lý, dị ứng..."
                          className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold min-h-[120px]"
                        />
                      </div>
                    </Card>
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
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      Đổi mật khẩu
                    </h3>
                    <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Mật khẩu hiện tại
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pl-10 pr-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-orange-500 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
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
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pl-10 pr-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleChangePassword}
                          disabled={isLoading}
                          className="w-full h-12 rounded-xl bg-slate-900 dark:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider mt-2"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Cập nhật mật khẩu
                        </Button>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      Đăng xuất
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      Đăng xuất tài khoản
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
        <div className="p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23]/80 backdrop-blur-xl z-50 pb-safe">
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
      <Sheet
        visible={isContactSheetOpen}
        onClose={() => setIsContactSheetOpen(false)}
        mask
        handler
        swipeToClose
      >
        <div className="flex flex-col h-[70vh] w-full bg-white dark:bg-[#1a1d23] rounded-t-3xl overflow-hidden relative text-left">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#353A45] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {editingContactId ? "Sửa liên hệ" : "Thêm liên hệ khẩn cấp"}
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Thông tin người liên hệ lúc khẩn cấp
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsContactSheetOpen(false)}
              className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Họ và tên
              </Label>
              <ZInput
                value={contactForm.fullName}
                onChange={(e) =>
                  setContactForm({ ...contactForm, fullName: e.target.value })
                }
                placeholder="Nhập họ tên"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Mối quan hệ
              </Label>
              <ZSelect
                placeholder="Chọn mối quan hệ"
                value={contactForm.relationship}
                onChange={(val) =>
                  setContactForm({
                    ...contactForm,
                    relationship: val as string,
                  })
                }
                closeOnSelect
                mask
                className="h-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
              >
                <Option value="Bố/Mẹ" title="Bố/Mẹ" />
                <Option value="Vợ/Chồng" title="Vợ/Chồng" />
                <Option value="Anh/Chị/Em" title="Anh/Chị/Em" />
                <Option value="Bạn bè" title="Bạn bè" />
                <Option value="Khác" title="Khác" />
              </ZSelect>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Số điện thoại
              </Label>
              <ZInput
                value={contactForm.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 11) {
                    setContactForm({ ...contactForm, phone: val });
                  }
                }}
                placeholder="Nhập số điện thoại (10-11 số)"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ghi chú
              </Label>
              <Textarea
                value={contactForm.notes}
                onChange={(e) =>
                  setContactForm({ ...contactForm, notes: e.target.value })
                }
                placeholder="Thông tin bổ sung..."
                className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold min-h-[100px]"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-30 pb-safe">
            <Button
              className="w-full h-14 rounded-2xl bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
              onClick={handleSaveContact}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Cập nhật liên hệ"
              )}
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet
        visible={isDependentSheetOpen}
        onClose={() => setIsDependentSheetOpen(false)}
        mask
        handler
        swipeToClose
      >
        <div className="flex flex-col h-[80vh] w-full bg-white dark:bg-[#1a1d23] rounded-t-3xl overflow-hidden relative text-left">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#353A45] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {editingDependentId ? "Sửa thông tin" : "Thêm người thân"}
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Thông tin người phụ thuộc
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsDependentSheetOpen(false)}
              className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Họ và tên
              </Label>
              <ZInput
                value={dependentForm.fullName}
                onChange={(e) =>
                  setDependentForm({
                    ...dependentForm,
                    fullName: e.target.value,
                  })
                }
                placeholder="Nhập họ tên"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Mối quan hệ
              </Label>
              <ZSelect
                placeholder="Chọn mối quan hệ"
                value={dependentForm.relationship}
                onChange={(val) =>
                  setDependentForm({
                    ...dependentForm,
                    relationship: val as string,
                  })
                }
                closeOnSelect
                mask
                className="h-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
              >
                <Option value="Con cái" title="Con cái" />
                <Option value="Vợ/Chồng" title="Vợ/Chồng" />
                <Option value="Bố/Mẹ" title="Bố/Mẹ" />
                <Option value="Khác" title="Khác" />
              </ZSelect>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ngày sinh
              </Label>
              <DatePicker
                date={
                  dependentForm.birthday
                    ? new Date(dependentForm.birthday)
                    : undefined
                }
                setDate={(date) =>
                  setDependentForm({
                    ...dependentForm,
                    birthday: date ? format(date, "yyyy-MM-dd") : "",
                  })
                }
                className="w-full h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-900/50 font-bold text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Địa chỉ
              </Label>
              <ZInput
                value={dependentForm.address}
                onChange={(e) =>
                  setDependentForm({
                    ...dependentForm,
                    address: e.target.value,
                  })
                }
                placeholder="Địa chỉ thường trú"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ghi chú
              </Label>
              <Textarea
                value={dependentForm.notes}
                onChange={(e) =>
                  setDependentForm({ ...dependentForm, notes: e.target.value })
                }
                placeholder="Thông tin bổ sung..."
                className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold min-h-[80px]"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-30 pb-safe">
            <Button
              className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
              onClick={handleSaveDependent}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Cập nhật người thân"
              )}
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet
        visible={isBankSheetOpen}
        onClose={() => setIsBankSheetOpen(false)}
        mask
        handler
        swipeToClose
      >
        <div className="flex flex-col h-[75vh] w-full bg-white dark:bg-[#1a1d23] rounded-t-3xl overflow-hidden relative text-left">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#353A45] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-sm">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {editingBankAccountId ? "Sửa tài khoản" : "Thêm ngân hàng"}
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Thông tin thanh toán lương
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsBankSheetOpen(false)}
              className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tên ngân hàng
              </Label>
              <ZInput
                value={bankForm.bankName}
                onChange={(e) =>
                  setBankForm({ ...bankForm, bankName: e.target.value })
                }
                placeholder="Ví dụ: Vietcombank, Techcombank..."
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Số tài khoản
              </Label>
              <ZInput
                value={bankForm.accountNumber}
                onChange={(e) =>
                  setBankForm({ ...bankForm, accountNumber: e.target.value })
                }
                placeholder="Nhập số tài khoản"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Chủ tài khoản
              </Label>
              <ZInput
                value={bankForm.accountHolderName}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    accountHolderName: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Tên in trên thẻ"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Chi nhánh
              </Label>
              <ZInput
                value={bankForm.branchName}
                onChange={(e) =>
                  setBankForm({ ...bankForm, branchName: e.target.value })
                }
                placeholder="Ví dụ: Ba Đình, Hà Nội"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none font-bold"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Tài khoản mặc định
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  Dùng để nhận lương hàng tháng
                </p>
              </div>
              <input
                type="checkbox"
                checked={bankForm.isDefault}
                onChange={(e) =>
                  setBankForm({ ...bankForm, isDefault: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-30 pb-safe">
            <Button
              className="w-full h-14 rounded-2xl bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
              onClick={handleSaveBankAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Lưu tài khoản"
              )}
            </Button>
          </div>
        </div>
      </Sheet>
    </PageContainer>
  );
}
