import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "zmp-ui";
import { AppBadge, useAppConfigStore } from "@/store/config-store";
import { Bell, Download, Info } from "lucide-react";

interface BadgeNotificationProps {
  badge: AppBadge;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge }) => {
  const { dismissBadge } = useAppConfigStore();
  const [snoozeChecked, setSnoozeChecked] = React.useState(false);

  const getIcon = () => {
    switch (badge.type) {
      case "version_update":
        return <Download className="h-6 w-6 text-blue-500" />;
      case "notice":
        return <Bell className="h-6 w-6 text-orange-500" />;
      default:
        return <Info className="h-6 w-6 text-slate-400" />;
    }
  };

  const handleAction = () => {
    if (badge.actionUrl) {
      window.open(badge.actionUrl, "_blank");
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open && badge.isClosable) {
      dismissBadge(badge.id, snoozeChecked);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose={!badge.isClosable}
        onPointerDownOutside={(e) => {
          if (!badge.isClosable) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!badge.isClosable) e.preventDefault();
        }}
        className="max-w-[340px] p-0 overflow-hidden border-none"
      >
        <div className="bg-white p-8 flex flex-col items-center">
          <div className="mb-6 h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center ring-8 ring-slate-50/50">
            {getIcon()}
          </div>

          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-black text-slate-900 text-center leading-tight">
              {badge.title}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 text-center leading-relaxed">
              {badge.content}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-3 mt-8">
            {badge.actionUrl && (
              <Button
                fullWidth
                className="h-12 rounded-xl bg-orange-600 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-all"
                onClick={handleAction}
              >
                {badge.type === 'version_update' ? 'Cập nhật ngay' : 'Xem chi tiết'}
              </Button>
            )}

            {badge.isClosable && (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id={`snooze-${badge.id}`}
                    checked={snoozeChecked}
                    onChange={(e) => setSnoozeChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                  />
                  <label
                    htmlFor={`snooze-${badge.id}`}
                    className="text-xs font-bold text-slate-500 cursor-pointer select-none"
                  >
                    Không hiện lại trong 24h
                  </label>
                </div>
                <Button
                  fullWidth
                  variant="secondary"
                  className="h-12 rounded-xl bg-slate-100 text-slate-600 font-bold uppercase text-xs tracking-widest active:scale-[0.98] transition-all border-none"
                  onClick={() => dismissBadge(badge.id, snoozeChecked)}
                >
                  Đóng
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeNotification;
