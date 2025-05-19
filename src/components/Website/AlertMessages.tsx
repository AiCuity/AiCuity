
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AlertMessagesProps = {
  apiError: string | null;
  isSimulatedContent: boolean;
};

const AlertMessages = ({ apiError, isSimulatedContent }: AlertMessagesProps) => {
  if (!apiError && !isSimulatedContent) return null;
  
  return (
    <>
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      
      {isSimulatedContent && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Using simulated content</AlertTitle>
          <AlertDescription>
            The content extraction API couldn't access the actual website content.
            This might be due to CORS restrictions or network issues.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AlertMessages;
