import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, ExternalLink, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/utils/types';
import CalibrationButton from '@/components/CalibrationButton';
import ThemeToggle from '@/components/ui/theme-toggle';
import GlassesQRGenerator from '@/components/GlassesQRGenerator';

interface ContentHeaderProps {
  content: Content;
  isFullscreen?: boolean;
  contentId?: string;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ content, isFullscreen, contentId }) => {
  const navigate = useNavigate();

  if (isFullscreen) {
    return null; // Hide header in fullscreen mode
  }

  return (
    <div className="flex flex-col">
      {/* Professional Sticky Header */}
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-4xl">
          <div className="flex h-16 items-center gap-3 sm:gap-4">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="px-2 sm:px-3 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="hidden sm:block h-6 w-px bg-border flex-shrink-0"></div>
            
            {/* Icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            
            {/* Title and Source - with proper overflow handling */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate leading-tight">
                {content.title}
              </h1>
              {content.source && (
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-0.5">
                  <span className="truncate flex-1 min-w-0">{content.source}</span>
                  {content.url && (
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex flex-shrink-0 hover:text-blue-500 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <CalibrationButton size="sm" />
                <ThemeToggle />
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
              
              {/* Mobile - only theme toggle */}
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Generator - positioned below header */}
      {contentId && (
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-4xl py-4">
          <div className="flex justify-center sm:justify-end">
            <GlassesQRGenerator
              contentId={contentId}
              title={content.title}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentHeader;
