
import { useState, useCallback } from "react";

export const useNotifications = (initialState = true) => {
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
