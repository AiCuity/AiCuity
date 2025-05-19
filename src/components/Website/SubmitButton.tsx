
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  isLoading: boolean;
};

const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button type="submit" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Extracting...
        </>
      ) : (
        "Extract Content"
      )}
    </Button>
  );
};

export default SubmitButton;
