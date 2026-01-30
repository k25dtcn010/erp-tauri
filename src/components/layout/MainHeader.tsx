import React, { useEffect } from "react";
import { CustomPageHeader, HeaderVariant } from "./CustomPageHeader";
import { useUserStore } from "@/store/user-store";

interface MainHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  variant?: HeaderVariant;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  subtitle,
  onBack,
  variant = "default",
}) => {
  const { userName, userAvatar, fetchUser } = useUserStore();

  // Ensure user data is fetched if not present
  useEffect(() => {
    if (!userName) {
      fetchUser();
    }
  }, [userName, fetchUser]);

  return (
    <CustomPageHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      user={{ name: userName, avatar: userAvatar }}
      variant={variant}
    />
  );
};
