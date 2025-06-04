import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bookmark } from "lucide-react";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

interface ReaderAlertsProps {
  isSimulated: boolean;
  initialPosition: number;
  content: string;
}

const ReaderAlerts = ({ isSimulated, initialPosition, content }: ReaderAlertsProps) => {
  // Calculate progress percentage using the utility function
  // Fix: Use content.split() to get word count instead of passing content directly
  const contentWordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const progressPercentage = calculateProgressPercentage(initialPosition, contentWordCount);
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {isSimulated && (
        <Alert variant="destructive" className="border border-red-200 dark:border-red-700">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-sm sm:text-base">
              <span className="font-medium">Simulated Content:</span> The app couldn't access the actual content from this website.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {initialPosition > 0 && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2 sm:gap-3">
            <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Resume Reading:</span> You have a saved reading position at {progressPercentage}% through this content.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default ReaderAlerts;
