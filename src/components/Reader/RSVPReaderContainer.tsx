import React, { useEffect, useState } from "react";
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
  const [currentPosition, setCurrentPosition] = useState(initialPosition);

  // Check for updated position from session storage (set by word clicking)
  useEffect(() => {
    console.log(`RSVPReaderContainer - Initial position prop: ${initialPosition}`);
    
    const sessionPosition = sessionStorage.getItem('initialPosition');
    console.log(`RSVPReaderContainer - Session storage position: ${sessionPosition}`);
    
    if (sessionPosition) {
      const position = parseInt(sessionPosition, 10);
      console.log(`RSVPReaderContainer - Using session position: ${position}`);
      setCurrentPosition(position);
    } else {
      console.log(`RSVPReaderContainer - Using initial position prop: ${initialPosition}`);
      setCurrentPosition(initialPosition);
    }
  }, [initialPosition]);

  // Log initial position and WPM for debugging
  useEffect(() => {
    console.log(`RSVPReaderContainer - Final position being passed to RSVPReader: ${currentPosition}`);
    console.log(`RSVPReaderContainer - WPM being passed to RSVPReader: ${initialWpm}`);
  }, [currentPosition, initialWpm]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <RSVPReader 
        text={useFullText ? content : summary} 
        contentId={contentId || ""} 
        title={title}
        source={source}
        initialPosition={currentPosition}
        initialWpm={initialWpm} // Pass the initialWpm to the RSVPReader
      />
    </div>
  );
};

export default RSVPReaderContainer;
