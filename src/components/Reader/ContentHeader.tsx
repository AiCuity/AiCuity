
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/utils/types';
import CalibrationButton from '@/components/CalibrationButton';
import ThemeToggle from '@/components/ui/theme-toggle';

interface ContentHeaderProps {
  content: Content;
  isFullscreen?: boolean;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ content, isFullscreen }) => {
  const navigate = useNavigate();
  
  if (isFullscreen) {
    return null; // Hide header in fullscreen mode
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold line-clamp-1">{content.title}</h1>
          {content.source && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="line-clamp-1">{content.source}</span>
              {content.url && (
                <a 
                  href={content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <CalibrationButton size="sm" />
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bookmark className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ContentHeader;
