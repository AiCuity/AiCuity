
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bookmark } from "lucide-react";

interface ReaderAlertsProps {
  isSimulated: boolean;
  initialPosition: number;
  content: string;
}

const ReaderAlerts = ({ isSimulated, initialPosition, content }: ReaderAlertsProps) => {
  // Calculate progress percentage more accurately
  const totalWords = content ? content.split(/\s+/).filter(word => word.length > 0).length : 0;
  const progressPercentage = totalWords > 0 
    ? Math.min(Math.round((initialPosition / totalWords) * 100), 100)
    : 0;
  
  return (
    <>
      {isSimulated && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Using simulated content. The app couldn't access the actual content from this website.
          </AlertDescription>
        </Alert>
      )}

      {initialPosition > 0 && (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <Bookmark className="h-4 w-4 mr-2 text-blue-500" />
            <AlertDescription>
              You have a saved reading position at {progressPercentage}% through this content.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </>
  );
};

export default ReaderAlerts;
