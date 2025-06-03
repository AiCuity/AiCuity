import React from 'react';
import { Loader2, Upload } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
  hasFile: boolean;
}

const SubmitButton = ({ isLoading, hasFile }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 sm:py-2 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      disabled={isLoading || !hasFile}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Processing...</span>
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Upload and Process</span>
        </>
      )}
    </button>
  );
};

export default SubmitButton;
