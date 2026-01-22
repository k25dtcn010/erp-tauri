import { useState, useMemo } from "react";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Employee {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
}

interface GroupAttendanceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onConfirm: (selectedIds: number[]) => void;
}

export function GroupAttendanceModal({
  isOpen,
  onOpenChange,
  employees,
  onConfirm,
}: GroupAttendanceModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleEmployee = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
    onOpenChange(false);
    setSelectedIds(new Set()); // Reset for next time
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toString().includes(searchTerm),
    );
  }, [employees, searchTerm]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-left">
              <DrawerTitle className="text-xl font-bold">
                Chấm công nhóm
              </DrawerTitle>
              <DrawerDescription className="text-gray-500">
                Chọn các thành viên bạn muốn chấm công cùng
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 flex flex-col gap-4 overflow-hidden">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              className="w-full pl-11 pr-4 py-3.5 bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-white/10 rounded-2xl text-sm transition-all outline-none shadow-sm"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 -mx-4 px-4 h-[400px]">
            <div className="flex flex-col gap-3 pb-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => toggleEmployee(emp.id)}
                  className={`flex items-center gap-4 p-4 rounded-[24px] transition-all active:scale-[0.98] cursor-pointer ${
                    selectedIds.has(emp.id)
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 shadow-sm"
                      : "bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800"
                  } border`}
                >
                  <Checkbox
                    checked={selectedIds.has(emp.id)}
                    onCheckedChange={() => toggleEmployee(emp.id)}
                    className="h-6 w-6 rounded-full border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white shadow-none"
                  />
                  <Avatar className="h-11 w-11 border-2 border-white dark:border-white/10 shadow-sm shrink-0">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0 text-left">
                    <span className="font-bold text-slate-900 dark:text-white text-[15px] truncate leading-tight">
                      {emp.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {emp.role || "Nhân viên"} • ID: {emp.id}
                    </span>
                  </div>
                  {selectedIds.has(emp.id) && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500 text-white border-none text-[10px] font-black px-2 py-0.5 h-6 rounded-full shadow-sm"
                    >
                      SELECTED
                    </Badge>
                  )}
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold">
                    Không tìm thấy thành viên nào
                  </p>
                  <p className="text-xs mt-1">Vui lòng thử từ khóa khác</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DrawerFooter className="border-t p-5 flex flex-row items-center gap-4 bg-gray-50/80 dark:bg-[#1a1d23]">
          <div className="flex-1 text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
              Đã chọn
            </div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 flex items-baseline gap-1">
              {selectedIds.size}{" "}
              <span className="text-xs font-bold text-gray-400 uppercase">
                nhân viên
              </span>
            </div>
          </div>

          <Button
            size="lg"
            disabled={selectedIds.size === 0}
            onClick={handleConfirm}
            className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            Tiếp tục (Xác minh)
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
