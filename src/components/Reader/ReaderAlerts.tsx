
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ReaderAlertsProps {
  isSimulated: boolean;
  initialPosition: number;
  content: string;
}

const ReaderAlerts = ({ isSimulated, initialPosition, content }: ReaderAlertsProps) => {
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
          <AlertDescription>
            You have a saved reading position at {Math.round((initialPosition / (content.split(/\s+/).length || 1)) * 100)}% through this content.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ReaderAlerts;
