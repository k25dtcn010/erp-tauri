import React, { useMemo, useState, useEffect } from "react";
import { Picker, Input } from "zmp-ui";
import { Clock } from "lucide-react";

interface TimePickerProps {
  label?: string;
  placeholder?: string;
  value?: string; // Format "HH:mm"
  onChange?: (value: string) => void;
  helperText?: string;
  errorText?: string;
  status?: "default" | "error" | "success";
  disabled?: boolean;
  inputClass?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  placeholder = "Chọn thời gian",
  value,
  onChange,
  helperText,
  errorText,
  status,
  disabled,
  inputClass,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState<{
    hour: { value: number; displayName: string };
    minute: { value: number; displayName: string };
  }>({
    hour: { value: 0, displayName: "00" },
    minute: { value: 0, displayName: "00" },
  });

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      value: i,
      displayName: i.toString().padStart(2, "0"),
      key: `hour-${i}`,
    }));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      value: i,
      displayName: i.toString().padStart(2, "0"),
      key: `minute-${i}`,
    }));
  }, []);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      const hourVal = parseInt(h, 10);
      const minuteVal = parseInt(m, 10);

      if (!isNaN(hourVal) && !isNaN(minuteVal)) {
        setPickerValue({
          hour: {
            value: hourVal,
            displayName: hourVal.toString().padStart(2, "0"),
          },
          minute: {
            value: minuteVal,
            displayName: minuteVal.toString().padStart(2, "0"),
          },
        });
      }
    }
  }, [value]);

  return (
    <div className={`w-full ${className || ""}`}>
      <Picker
        inputClass={inputClass}
        label={label}
        placeholder={placeholder}
        helperText={helperText}
        errorText={errorText}
        disabled={disabled}
        mask
        maskClosable
        title="Chọn thời gian"
        action={{
          text: "Xác nhận",
          close: true,
        }}
        data={[
          {
            options: hours,
            name: "hour",
          },
          {
            options: minutes,
            name: "minute",
          },
        ]}
        value={{
          hour: pickerValue.hour.value,
          minute: pickerValue.minute.value,
        }}
        formatPickedValueDisplay={({ hour, minute }) => {
          if (!hour || !minute) return "";
          return `${hour.displayName}:${minute.displayName}`;
        }}
        onChange={(data: any) => {
          const newHour = data.hour;
          const newMinute = data.minute;
          const newValueString = `${newHour.displayName}:${newMinute.displayName}`;
          setPickerValue({
            hour: newHour,
            minute: newMinute,
          });
          if (onChange) {
            onChange(newValueString);
          }
        }}
      />
    </div>
  );
};
