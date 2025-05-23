
import { useEffect } from "react";
import { useReadingHistory } from "@/hooks/useReadingHistory";

/**
 * Hook to fetch initial reading history data
 */
export function useInitialDataFetch() {
  const { fetchHistory } = useReadingHistory();

  // Refresh history when component mounts
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {};
}
