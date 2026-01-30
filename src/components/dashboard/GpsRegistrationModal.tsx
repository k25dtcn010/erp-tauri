import React, { useState } from "react";
import { Sheet, Box, Text, Input, Button, useSnackbar, DatePicker } from "zmp-ui";
import { MapPin, Calendar, Navigation } from "lucide-react";
import { format } from "date-fns";
import { postApiV3Gps, postApiV3GpsAssignments } from "../../client-timekeeping/sdk.gen";

interface GpsRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    latitude: number;
    longitude: number;
    distance?: number;
    nearestLocationName?: string;
  };
  employeeId: string;
  onSuccess: () => void;
}

export const GpsRegistrationModal: React.FC<GpsRegistrationModalProps> = ({
  isOpen,
  onClose,
  location,
  employeeId,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { openSnackbar } = useSnackbar();

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      openSnackbar({ text: "Vui lòng nhập tên địa điểm", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create GPS Location
      const createRes = await postApiV3Gps({
        body: {
          name: name.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMeters: 100,
          isActive: true,
        },
      });

      const gpsData = createRes.data as any;
      const gpsId = gpsData?.id;

      if (!gpsId) throw new Error("Không lấy được ID địa điểm mới");

      // Step 2: Assign GPS to Employee
      await postApiV3GpsAssignments({
        body: {
          gpsLocationId: gpsId,
          assignmentType: "EMPLOYEE",
          targetId: employeeId,
          activationDate: startDate.toISOString(),
          expirationDate: endDate ? endDate.toISOString() : undefined,
        },
      });

      openSnackbar({ text: "Đăng ký địa điểm mới thành công!", type: "success" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("GPS Registration error:", error);
      openSnackbar({ text: "Có lỗi xảy ra khi đăng ký địa điểm", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      autoHeight
      mask
      swipeToClose
      title="Đăng ký địa điểm mới"
    >
      <Box className="p-4 space-y-4">
        {location.distance && (
          <Box className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
            <Navigation className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <Text className="text-amber-800 text-sm">
              Bạn đang cách <b>{location.nearestLocationName || "vị trí quy định"}</b> khoảng{" "}
              <b>{formatDistance(location.distance)}</b>. Bạn có muốn đăng ký vị trí này không?
            </Text>
          </Box>
        )}

        <Box className="space-y-4 mt-2">
          <Box>
            <Text className="text-xs font-semibold text-gray-500 mb-1 uppercase">Tên địa điểm *</Text>
            <Input
              placeholder="Ví dụ: Văn phòng khách hàng A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              prefix={<MapPin className="h-4 w-4 text-gray-400" />}
            />
          </Box>

          <Box className="grid grid-cols-2 gap-3">
            <Box>
              <Text className="text-xs font-semibold text-gray-500 mb-1 uppercase">
                Ngày bắt đầu *
              </Text>
              <DatePicker
                mask
                maskClosable
                title="Chọn ngày bắt đầu"
                dateFormat="dd/mm/yyyy"
                value={startDate}
                onChange={(value) => setStartDate(value as Date)}
              />
            </Box>
            <Box>
              <Text className="text-xs font-semibold text-gray-500 mb-1 uppercase">
                Ngày kết thúc
              </Text>
              <DatePicker
                mask
                maskClosable
                title="Chọn ngày kết thúc"
                dateFormat="dd/mm/yyyy"
                value={endDate || undefined}
                onChange={(value) => setEndDate(value as Date)}
              />
            </Box>
          </Box>

          <Box className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
            <Text className="text-xs text-gray-500 mb-1">Tọa độ tự động:</Text>
            <Text className="text-sm font-mono text-gray-700">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </Box>
        </Box>

        <Box className="flex gap-3 pt-2 pb-4">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button className="flex-1" onClick={handleRegister} loading={isLoading}>
            Xác nhận đăng ký
          </Button>
        </Box>
      </Box>
    </Sheet>
  );
};
