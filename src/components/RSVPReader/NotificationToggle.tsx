import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationToggleProps {
  showNotifications: boolean;
  onToggle: () => void;
  isGlassesMode?: boolean;
}

const NotificationToggle = ({ 
  showNotifications, 
  onToggle, 
  isGlassesMode = false 
}: NotificationToggleProps) => {
  return (
    <Button 
      variant={isGlassesMode ? "secondary" : "outline"}
      size="sm" 
      onClick={onToggle}
      className={`flex items-center gap-1 ${
        isGlassesMode 
          ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700" 
          : ""
      }`}
    >
      {showNotifications ? (
        <>
          <Bell className="h-4 w-4" />
          Notifications On
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Notifications Off
        </>
      )}
    </Button>
  );
};

export default NotificationToggle;
