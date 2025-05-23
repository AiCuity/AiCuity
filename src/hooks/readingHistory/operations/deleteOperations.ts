
import { supabase } from '@/integrations/supabase/client';
import { ReadingHistoryEntry } from '../types';
import { useToast } from '@/hooks/use-toast';

/**
 * Delete a reading history entry from Supabase or localStorage
 */
export const deleteHistoryEntry = async (
  id: string,
  user: any | null,
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  refreshHistory: () => Promise<void>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (user) {
    return deleteFromSupabase(id, user, setHistory, refreshHistory, toast);
  } else {
    return deleteFromLocalStorage(id, setHistory, toast);
  }
};

const deleteFromSupabase = async (
  id: string, 
  user: any,
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  refreshHistory: () => Promise<void>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    // Delete from Supabase if user is logged in
    const { error } = await supabase
      .from('reading_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure we only delete entries belonging to this user

    if (error) {
      throw error;
    }

    // Immediately update the local state to remove the deleted entry
    setHistory(prev => prev.filter(entry => entry.id !== id));
    
    toast({
      title: 'Entry deleted',
      description: 'Reading history entry has been deleted.',
    });
    
    // Force a refresh of the history from the database
    await refreshHistory();
    
    return true;
  } catch (error) {
    console.error('Error deleting reading history:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete reading history entry.',
      variant: 'destructive',
    });
    return false;
  }
};

const deleteFromLocalStorage = async (
  id: string,
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    // Delete from localStorage if user is not logged in
    const localHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    const updatedHistory = localHistory.filter((entry: ReadingHistoryEntry) => entry.id !== id);
    
    localStorage.setItem('readingHistory', JSON.stringify(updatedHistory));
    
    // Immediately update the local state
    setHistory(prev => prev.filter(entry => entry.id !== id));
    
    toast({
      title: 'Entry deleted',
      description: 'Reading history entry has been deleted.',
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting local reading history:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete reading history entry.',
      variant: 'destructive',
    });
    return false;
  }
};
