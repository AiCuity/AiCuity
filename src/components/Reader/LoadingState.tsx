
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading content...</p>
    </div>
  );
};

export default LoadingState;
