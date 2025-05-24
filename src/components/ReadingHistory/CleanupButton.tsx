
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
      className="flex items-center gap-2"
    >
      {isCleaningUp ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isCleaningUp ? 'Cleaning...' : 'Remove Duplicates'}
    </Button>
  );
};

export default CleanupButton;
