import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  apiError: string | null;
}

const ErrorDisplay = ({ apiError }: ErrorDisplayProps) => {
  if (!apiError) return null;

  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 border border-red-200 dark:border-red-800">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200">
            There was an error processing your file.
          </h3>
          <div className="mt-2 text-sm sm:text-base text-red-700 dark:text-red-300">
            <p className="break-words">{apiError}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
