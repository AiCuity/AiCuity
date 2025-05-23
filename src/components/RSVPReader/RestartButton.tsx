
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestartButtonProps {
  onClick: () => void;
}

const RestartButton = ({ onClick }: RestartButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="flex items-center gap-1"
    >
      <RefreshCw className="h-4 w-4" />
      Restart
    </Button>
  );
};

export default RestartButton;
