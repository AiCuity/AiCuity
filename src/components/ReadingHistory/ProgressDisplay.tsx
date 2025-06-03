
import { Progress } from "@/components/ui/progress";

interface ProgressDisplayProps {
  progress: number;
}

const ProgressDisplay = ({ progress }: ProgressDisplayProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Progress 
        value={progress} 
        className="h-2 w-20 w-full"
      />
      <span className="text-xs font-medium">{progress}%</span>
    </div>
  );
};

export default ProgressDisplay;
