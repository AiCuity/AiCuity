
import React from 'react';

interface SubmitButtonProps {
  isLoading: boolean;
  hasFile: boolean;
}

const SubmitButton = ({ isLoading, hasFile }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading || !hasFile}
    >
      {isLoading ? "Processing..." : "Upload and Process"}
    </button>
  );
};

export default SubmitButton;
