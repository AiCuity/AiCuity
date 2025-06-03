import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDuplicateCleanup } from '@/hooks/readingHistory/operations/duplicateCleanupOperations';

interface CleanupButtonProps {
  onCleanupComplete: () => void;
}

const CleanupButton = ({ onCleanupComplete }: CleanupButtonProps) => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { user } = useAuth();
  const { cleanupDuplicates } = useDuplicateCleanup();

  const handleCleanup = async () => {
    if (!user) return;
    
    setIsCleaningUp(true);
    try {
      const result = await cleanupDuplicates(user.id);
      if (result.success && result.duplicatesRemoved > 0) {
        // Refresh the history list after cleanup
        onCleanupComplete();
      }
    } finally {
      setIsCleaningUp(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCleanup}
      disabled={isCleaningUp}
      className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
    >
      {isCleaningUp ? (
        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
      ) : (
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
      )}
      <span className="hidden sm:inline">
        {isCleaningUp ? 'Cleaning...' : 'Remove Duplicates'}
      </span>
      <span className="sm:hidden">
        {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
      </span>
    </Button>
  );
};

export default CleanupButton;
