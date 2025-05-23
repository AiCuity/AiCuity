
import React, { useEffect } from "react";
import RSVPReader from "@/components/RSVPReader";

interface RSVPReaderContainerProps {
  useFullText: boolean;
  content: string;
  summary: string;
  contentId?: string;
  title: string;
  source?: string;
  initialPosition: number;
}

const RSVPReaderContainer = ({ 
  useFullText, 
  content, 
  summary, 
  contentId, 
  title, 
  source, 
  initialPosition 
}: RSVPReaderContainerProps) => {
  // Log initial position for debugging
  useEffect(() => {
    console.log(`RSVPReaderContainer initializing with position: ${initialPosition}`);
  }, [initialPosition]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <RSVPReader 
        text={useFullText ? content : summary} 
        contentId={contentId || ""} 
        title={title}
        source={source}
        initialPosition={initialPosition}
      />
    </div>
  );
};

export default RSVPReaderContainer;
