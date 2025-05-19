
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ProgressBarProps {
  progress: number;
  complexity?: number;
}

const ProgressBar = ({ progress, complexity = 0 }: ProgressBarProps) => {
  // Ensure the progress value is within the valid range
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Determine color based on complexity (0-1)
  // Lower complexity = blue, medium = green, higher complexity = amber, highest = red
  const getBarColor = () => {
    if (complexity < 0.3) return "bg-blue-500"; 
    if (complexity < 0.5) return "bg-green-500";
    if (complexity < 0.7) return "bg-amber-500";
    return "bg-red-500";
  };

  const getComplexityLabel = () => {
    if (complexity < 0.3) return "Low complexity"; 
    if (complexity < 0.5) return "Medium complexity";
    if (complexity < 0.7) return "High complexity";
    return "Very high complexity";
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor()} transition-all duration-300`}
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Progress: {Math.round(normalizedProgress)}% - {getComplexityLabel()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ProgressBar;
