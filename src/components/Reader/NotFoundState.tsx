
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon, RefreshCw } from "lucide-react";

const NotFoundState = () => {
  // Get the current URL to check if it's from history
  const currentPath = window.location.pathname;
  const isFromHistory = currentPath.includes('/reader/');
  const contentId = isFromHistory ? currentPath.split('/reader/')[1] : null;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Content Not Found</h2>
        
        {isFromHistory ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The content for this reading session could not be loaded. This may happen if:
            </p>
            <ul className="list-disc text-left text-gray-600 dark:text-gray-400 mb-8 pl-6">
              <li className="mb-2">The original source is no longer available</li>
              <li className="mb-2">The content wasn't saved with your reading history</li>
              <li className="mb-2">Your browser storage has been cleared</li>
            </ul>
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The requested content could not be loaded. Please try uploading your file or entering a URL again.
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
          
          <Link to={isFromHistory ? "/reader" : "/"}>
            <Button className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundState;
