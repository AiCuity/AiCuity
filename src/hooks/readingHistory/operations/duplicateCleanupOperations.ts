import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DuplicateCleanupResult {
  success: boolean;
  duplicatesFound: number;
  duplicatesRemoved: number;
  error?: string;
}

/**
 * Removes duplicate reading history entries, keeping only the most recent one for each title
 */
export async function cleanupDuplicateEntries(userId: string): Promise<DuplicateCleanupResult> {
  try {
    console.log('Starting duplicate cleanup for user:', userId);
    
    // First, get all reading history entries for the user
    const { data: allEntries, error: fetchError } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    if (!allEntries || allEntries.length === 0) {
      return {
        success: true,
        duplicatesFound: 0,
        duplicatesRemoved: 0
      };
    }

    // Group entries by title to find duplicates
    const entriesByTitle = new Map<string, typeof allEntries>();
    
    allEntries.forEach(entry => {
      const title = entry.title.trim().toLowerCase();
      if (!entriesByTitle.has(title)) {
        entriesByTitle.set(title, []);
      }
      entriesByTitle.get(title)!.push(entry);
    });

    // Find titles with duplicates
    const duplicateGroups = Array.from(entriesByTitle.entries())
      .filter(([_, entries]) => entries.length > 1);

    if (duplicateGroups.length === 0) {
      console.log('No duplicates found');
      return {
        success: true,
        duplicatesFound: 0,
        duplicatesRemoved: 0
      };
    }

    // Collect IDs of entries to delete (all but the most recent for each title)
    const idsToDelete: string[] = [];
    let totalDuplicates = 0;

    duplicateGroups.forEach(([title, entries]) => {
      // Sort by updated_at descending to get the most recent first
      const sortedEntries = entries.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      // Keep the first (most recent) entry, mark the rest for deletion
      const toDelete = sortedEntries.slice(1);
      idsToDelete.push(...toDelete.map(entry => entry.id));
      totalDuplicates += entries.length;
      
      console.log(`Found ${entries.length} duplicates for title: "${title}", keeping most recent from ${sortedEntries[0].updated_at}`);
    });

    // Delete the duplicate entries
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('reading_history')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        throw deleteError;
      }

      console.log(`Successfully removed ${idsToDelete.length} duplicate entries`);
    }

    return {
      success: true,
      duplicatesFound: totalDuplicates,
      duplicatesRemoved: idsToDelete.length
    };

  } catch (error) {
    console.error('Error during duplicate cleanup:', error);
    return {
      success: false,
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Hook for cleaning up duplicate entries with toast notifications
 */
export function useDuplicateCleanup() {
  const { toast } = useToast();

  const cleanupDuplicates = async (userId: string): Promise<DuplicateCleanupResult> => {
    const result = await cleanupDuplicateEntries(userId);
    
    if (result.success) {
      if (result.duplicatesRemoved > 0) {
        toast({
          title: 'Cleanup Complete',
          description: `Removed ${result.duplicatesRemoved} duplicate entries from your reading history.`,
        });
      } else {
        toast({
          title: 'No Duplicates Found',
          description: 'Your reading history is already clean.',
        });
      }
    } else {
      toast({
        title: 'Cleanup Failed',
        description: result.error || 'Failed to clean up duplicate entries.',
        variant: 'destructive',
      });
    }

    return result;
  };

  return { cleanupDuplicates };
}
