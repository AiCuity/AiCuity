
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
  initialWpm?: number; // Add this prop to the interface
}

const RSVPReaderContainer = ({ 
  useFullText, 
  content, 
  summary, 
  contentId, 
  title, 
  source, 
  initialPosition,
  initialWpm // Add this to the parameter list
}: RSVPReaderContainerProps) => {
  // Log initial position and WPM for debugging
  useEffect(() => {
    console.log(`RSVPReaderContainer initializing with position: ${initialPosition}`);
    console.log(`RSVPReaderContainer initializing with WPM: ${initialWpm}`);
  }, [initialPosition, initialWpm]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <RSVPReader 
        text={useFullText ? content : summary} 
        contentId={contentId || ""} 
        title={title}
        source={source}
        initialPosition={initialPosition}
        initialWpm={initialWpm} // Pass the initialWpm to the RSVPReader
      />
    </div>
  );
};

export default RSVPReaderContainer;
