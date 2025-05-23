
import { useState, useCallback, useEffect } from "react";

export interface NotificationsHook {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  toggleNotifications: () => void;
}

export const useNotifications = (initialState = true): NotificationsHook => {
  // Try to load preference from localStorage first
  const [showNotifications, setShowNotifications] = useState(() => {
    const savedPreference = localStorage.getItem('rsvp-notifications');
    // If we have a saved preference, use it, otherwise use the initialState
    return savedPreference !== null ? savedPreference === 'true' : initialState;
  });
  
  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rsvp-notifications', showNotifications.toString());
  }, [showNotifications]);
  
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);
  
  return {
    showNotifications,
    setShowNotifications,
    toggleNotifications
  };
};
