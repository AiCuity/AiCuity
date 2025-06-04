import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon, RefreshCw, BookOpen, AlertCircle } from "lucide-react";

const NotFoundState = () => {
  // Get the current URL to check if it's from history
  const currentPath = window.location.pathname;
  const isFromHistory = currentPath.includes('/reader/');
  const contentId = isFromHistory ? currentPath.split('/reader/')[1] : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* Error icon with gradient background */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-md">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Content Not Found
        </h2>
        
        {/* Description */}
        <div className="space-y-4 mb-8">
          {isFromHistory ? (
            <>
              <p className="text-sm sm:text-base text-muted-foreground">
                The content for this reading session could not be loaded. This may happen if:
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                <ul className="list-disc text-left text-xs sm:text-sm text-muted-foreground space-y-2 pl-4">
                  <li>The original source is no longer available</li>
                  <li>The content wasn't saved with your reading history</li>
                  <li>Your browser storage has been cleared</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm sm:text-base text-muted-foreground">
              The requested content could not be loaded. Please try uploading your file or entering a URL again.
            </p>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-border/50 hover:bg-white/80 dark:hover:bg-gray-800/80">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
          
          <Link to={isFromHistory ? "/reader" : "/"} className="w-full">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
        </div>
        
        {/* Help text */}
        <p className="text-xs text-muted-foreground mt-6 opacity-75">
          Need help? Contact support if this issue persists.
        </p>
      </div>
    </div>
  );
};

export default NotFoundState;
