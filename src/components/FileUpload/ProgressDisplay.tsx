
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProgressDisplayProps {
  isLoading: boolean;
}

const ProgressDisplay = ({ isLoading }: ProgressDisplayProps) => {
  if (!isLoading) return null;

  return (
    <div className="space-y-2">
      <Progress value={50} className="h-4" />
      <p className="text-sm text-gray-500">Processing file...</p>
    </div>
  );
};

export default ProgressDisplay;
