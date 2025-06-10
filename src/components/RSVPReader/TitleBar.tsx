import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, User, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TitleBarProps {
  title: string;
  wordCount: number;
  isFullscreen: boolean;
  isGlassesMode?: boolean;
  contentId?: string;
  onCloseReader?: () => void;
  source?: string;
}

const TitleBar = ({ title, wordCount, isFullscreen, isGlassesMode = false, contentId, onCloseReader, source }: TitleBarProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onCloseReader) {
      // Close the RSVP reader and return to reader selection page
      onCloseReader();
    } else if (contentId) {
      // Fallback: Navigate back to the reader page for this content
      navigate(`/reader/${contentId}`);
    } else {
      // Fallback: Navigate to landing page if no contentId
      navigate("/");
    }
  };

  const handleSourceClick = () => {
    if (source && source.startsWith('http')) {
      window.open(source, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAccountClick = () => {
    navigate('/account');
  };

  if (isFullscreen) {
    return null;
  }
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Mobile and Desktop Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 gap-3 sm:gap-4">
        
        {/* Top row on mobile, Left section on desktop */}
        <div className="flex items-center justify-between sm:justify-start">
          {/* Back button */}
          {!isGlassesMode && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="min-h-[44px] sm:min-h-0 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </Button>
          )}
          
          {/* Mobile menu for Account and Theme (visible only on small screens) */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* <ThemeToggle /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="min-h-[44px] px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2" onClick={handleAccountClick}>
                  <User className="h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-gray-600 dark:text-gray-400">
                  {wordCount} words
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and Source section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-2">
            <h2 className="text-base sm:text-lg font-medium truncate text-center sm:text-center">
              {title}
            </h2>
            {source && source.startsWith('http') && (
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="hidden sm:inline text-gray-400">-</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-blue-600 dark:text-blue-400 p-0 h-auto font-normal hover:underline text-xs sm:text-sm min-h-[44px] sm:min-h-0"
                  onClick={handleSourceClick}
                >
                  <span className="truncate max-w-[180px] sm:max-w-[200px]">
                    {source.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                  </span>
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop right section (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Account button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={handleAccountClick}>
            <User className="h-4 w-4 mr-1" />
            Account
          </Button>
          
          {/* <ThemeToggle /> */}
          
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
            <span className="font-medium">{wordCount} words</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
