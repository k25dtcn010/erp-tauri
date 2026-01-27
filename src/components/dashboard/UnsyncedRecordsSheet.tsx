import React, { useState, useEffect } from "react";
import { Sheet, Box, Text, Modal } from "zmp-ui";
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
  Eye,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnsyncedRecordsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

const PhotoPreview = ({
  photoId,
  onPreview,
}: {
  photoId?: string;
  onPreview: (url: string) => void;
}) => {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (photoId) {
      OfflineAttendanceService.getPhoto(photoId).then(setPhoto);
    }
  }, [photoId]);

  if (!photoId) return null;

  if (!photo)
    return (
      <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0" />
    );

  return (
    <div
      className="relative group cursor-pointer shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        onPreview(photo);
      }}
    >
      <img
        src={photo}
        className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
        alt="Preview"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <Eye className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

export const UnsyncedRecordsSheet: React.FC<UnsyncedRecordsSheetProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [syncingIds, setSyncingIds] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  const loadRecords = async () => {
    const data = await OfflineAttendanceService.getRecords();
    setRecords(data);
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
    try {
      const count = await OfflineAttendanceService.syncRecords();
      if (count > 0) {
        setRecords([]);
        onSyncComplete();
        setTimeout(onClose, 500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      await OfflineAttendanceService.deleteRecord(id);
      await loadRecords();
      onSyncComplete();
    }
  };

  return (
    <>
      <Sheet
        visible={isOpen}
        onClose={onClose}
        mask
        swipeToClose
        title="Dữ liệu chưa đồng bộ"
      >
        <Box className="p-4 flex flex-col" style={{ height: "75vh" }}>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
                <Text>Tất cả dữ liệu đã được đồng bộ</Text>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 gap-3"
                >
                  <div className="flex items-center justify-between">
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
                        <Text className="text-[11px] text-gray-500">
                          {format(
                            new Date(record.timestamp),
                            "HH:mm dd/MM/yyyy",
                            {
                              locale: vi,
                            },
                          )}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
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

                  <div className="flex gap-3 items-start">
                    <PhotoPreview
                      photoId={record.photoId}
                      onPreview={setPreviewUrl}
                    />
                    <div className="flex-1 space-y-1">
                      {record.location &&
                        record.location.latitude !== undefined &&
                        record.location.longitude !== undefined && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            <span className="truncate">
                              {(record.location.latitude ?? 0).toFixed(4)},{" "}
                              {(record.location.longitude ?? 0).toFixed(4)}
                            </span>
                          </div>
                        )}
                      {record.deviceInfo && (
                        <div className="text-[10px] text-gray-400 italic truncate">
                          Device: {record.deviceInfo.platform || "Unknown"} -{" "}
                          {record.deviceInfo.model || "Device"}
                        </div>
                      )}
                      {errors[record.id] && (
                        <div className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {errors[record.id]}
                        </div>
                      )}
                    </div>
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

      <Modal
        visible={!!previewUrl}
        title="Xem trước ảnh"
        onClose={() => setPreviewUrl(null)}
        actions={[
          {
            text: "Đóng",
            onClick: () => setPreviewUrl(null),
          },
        ]}
      >
        <Box className="flex items-center justify-center p-2">
          {previewUrl && (
            <img
              src={previewUrl}
              className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-lg"
              alt="Full Preview"
            />
          )}
        </Box>
      </Modal>
    </>
  );
};
