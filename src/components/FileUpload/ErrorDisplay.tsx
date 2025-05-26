
import React from 'react';

interface ErrorDisplayProps {
  apiError: string | null;
}

const ErrorDisplay = ({ apiError }: ErrorDisplayProps) => {
  if (!apiError) return null;

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            There was an error processing your file.
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{apiError}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
