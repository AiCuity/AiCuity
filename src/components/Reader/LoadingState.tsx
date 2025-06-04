import React from "react";
import { Loader2, BookOpen } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 sm:space-y-6">
        {/* Loading icon with gradient background */}
        <div className="relative flex justify-center">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Content
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md">
            Preparing your reading experience...
          </p>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
