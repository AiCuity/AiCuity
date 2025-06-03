import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  isLoading: boolean;
};

const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isLoading}
      className="w-full sm:w-auto h-10 sm:h-11 text-sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
          <span className="truncate">Extracting...</span>
        </>
      ) : (
        <span className="truncate">Extract Content</span>
      )}
    </Button>
  );
};

export default SubmitButton;
