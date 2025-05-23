
import { useState, useCallback } from "react";

export interface NotificationsHook {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  toggleNotifications: () => void;
}

export const useNotifications = (initialState = true): NotificationsHook => {
  const [showNotifications, setShowNotifications] = useState(initialState);
  
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);
  
  return {
    showNotifications,
    setShowNotifications,
    toggleNotifications
  };
};
