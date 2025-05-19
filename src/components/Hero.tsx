
import { BarChart3, BookOpen, Upload } from "lucide-react";

const Hero = () => {
  return (
    <div className="text-center pb-8">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
        SpeedRead
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
        Read faster with RSVP technology. Extract content from websites or files and improve your reading speed.
      </p>
      
      <div className="flex flex-wrap justify-center gap-8 mt-8">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <BookOpen className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Extract Website Content</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Upload className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Upload Documents</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Track Reading Progress</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
