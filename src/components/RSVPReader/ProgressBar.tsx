
interface ProgressBarProps {
  progress: number;
  complexity?: number;
}

const ProgressBar = ({ progress, complexity = 0 }: ProgressBarProps) => {
  // Determine color based on complexity (0-1)
  // Lower complexity = blue, medium = green, higher complexity = amber, highest = red
  const getBarColor = () => {
    if (complexity < 0.3) return "bg-blue-500"; 
    if (complexity < 0.5) return "bg-green-500";
    if (complexity < 0.7) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
