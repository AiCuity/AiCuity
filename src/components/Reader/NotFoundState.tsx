
import React from "react";

const NotFoundState = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Content Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The requested content could not be loaded. Please try uploading your file or entering a URL again.
        </p>
      </div>
    </div>
  );
};

export default NotFoundState;
