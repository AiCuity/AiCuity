
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationToggleProps {
  showNotifications: boolean;
  onToggle: () => void;
}

const NotificationToggle = ({ showNotifications, onToggle }: NotificationToggleProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onToggle}
      className="flex items-center gap-1"
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
