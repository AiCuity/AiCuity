
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function UsageDisplay() {
  const [usage, setUsage] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('current-usage', {
          body: { uid: user.id }
        });

        if (error) {
          console.error('Error fetching usage:', error);
          return;
        }

        setUsage(data.count);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  if (!user) return null;

  const usageCount = usage ?? 0;
  const usageLimit = 500;
  const usagePercentage = Math.min((usageCount / usageLimit) * 100, 100);

  return (
    <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Monthly Usage
          </h3>
          <span className="text-sm text-blue-600 dark:text-blue-300">
            {isLoading ? "Loading..." : `${usageCount} / ${usageLimit}`}
          </span>
        </div>
        
        <Progress 
          value={usagePercentage} 
          className="h-2"
        />
        
        <p className="text-xs text-blue-600 dark:text-blue-300">
          This month's uploads: {isLoading ? "..." : usageCount} / {usageLimit}
        </p>

        {usage && usage > 500 && (
          <div className="mt-4 rounded bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            You have exceeded 500 uploads this month. Please{' '}
            <a href="mailto:sales@aicuity.app" className="underline">contact us</a>{' '}
            for Enterprise pricing.
          </div>
        )}
      </div>
    </Card>
  );
}
