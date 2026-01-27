import React, { useState, useEffect } from "react";
import { Sheet, Box, Text, Button as ZmpButton, List, Icon } from "zmp-ui";
import {
  OfflineAttendanceService,
  AttendanceRecord,
} from "@/services/offline-attendance";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  UploadCloud,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnsyncedRecordsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const UnsyncedRecordsSheet: React.FC<UnsyncedRecordsSheetProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [syncingIds, setSyncingIds] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  const loadRecords = () => {
    setRecords(OfflineAttendanceService.getRecords());
  };

  const handleSyncOne = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSyncingIds((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });

    try {
      await OfflineAttendanceService.syncRecord(id);
      // Remove from list immediately upon success
      setRecords((prev) => prev.filter((r) => r.id !== id));
      onSyncComplete();

      // If no records left, close after a short delay
      if (records.length <= 1) {
        setTimeout(onClose, 500);
      }
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({ ...prev, [id]: "Lỗi kết nối" }));
    } finally {
      setSyncingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSyncAll = async () => {
    if (records.length === 0) return;

    setIsSyncingAll(true);
    // Simple approach: sync sequentially or parallel.
    // Since we have syncRecord, let's use that to give granular feedback if possible,
    // or just use the bulk sync method from service which is more efficient usually.
    // Use bulk for now.

    try {
      const count = await OfflineAttendanceService.syncRecords();
      if (count > 0) {
        setRecords([]);
        onSyncComplete();
        setTimeout(onClose, 500);
      }
    } catch (e) {
      console.error(e);
      // If bulk fails, maybe try individual? or just show error
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      OfflineAttendanceService.deleteRecord(id);
      loadRecords();
      onSyncComplete();
    }
  };

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      autoHeight
      mask
      swipeToClose
      title="Dữ liệu chưa đồng bộ"
    >
      <Box className="p-4 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
              <Text>Tất cả dữ liệu đã được đồng bộ</Text>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      record.type === "check-in"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {record.type === "check-in" ? (
                      <LogIn className="w-5 h-5" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <Text className="font-bold text-sm">
                      {record.type === "check-in" ? "Vào ca" : "Ra ca"}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {format(new Date(record.timestamp), "HH:mm dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </Text>
                    {errors[record.id] && (
                      <Text className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors[record.id]}
                      </Text>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={(e) => handleDelete(record.id, e)}
                    disabled={syncingIds[record.id] || isSyncingAll}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={(e) => handleSyncOne(record.id, e)}
                    disabled={syncingIds[record.id] || isSyncingAll}
                  >
                    {syncingIds[record.id] ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3 h-3" />
                    )}
                    Tải lên
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {records.length > 0 && (
          <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
            <Button
              className="w-full h-12 text-base font-bold gap-2"
              onClick={handleSyncAll}
              disabled={isSyncingAll}
            >
              {isSyncingAll ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang đồng bộ tất cả...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Đồng bộ tất cả ({records.length})
                </>
              )}
            </Button>
          </div>
        )}
      </Box>
    </Sheet>
  );
};
