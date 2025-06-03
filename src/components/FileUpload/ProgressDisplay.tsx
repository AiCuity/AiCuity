import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Loader2 } from 'lucide-react';

interface ProgressDisplayProps {
  isLoading: boolean;
}

const ProgressDisplay = ({ isLoading }: ProgressDisplayProps) => {
  if (!isLoading) return null;

  return (
    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
        <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 font-medium">
          Processing file...
        </p>
      </div>
      <Progress value={50} className="h-2 sm:h-3" />
      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
        Please wait while we process your file
      </p>
    </div>
  );
};

export default ProgressDisplay;
