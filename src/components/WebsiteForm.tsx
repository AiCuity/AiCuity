import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { extractContentFromUrl } from "../utils/contentExtractor";
import ContentPreview from "@/components/Reader/ContentPreview";
import WebsiteInput from "./Website/WebsiteInput";
import ExamplesList from "./Website/ExamplesList";
import AlertMessages from "./Website/AlertMessages";
import SubmitButton from "./Website/SubmitButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertTriangle, TrendingUp } from "lucide-react";
import SubscribeButton from "./SubscribeButton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api';

const WebsiteForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isSimulatedContent, setIsSimulatedContent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentUsage, 
    usageLimit, 
    isAtLimit, 
    isNearLimit, 
    canUseFeature, 
    remainingUsage, 
    tierName,
    isSubscribed 
  } = useUsageLimit();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setPreviewContent("");
    setIsSimulatedContent(false);
    
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Check usage limit before processing
    if (!canUseFeature) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your ${tierName} tier limit of ${usageLimit} books this month. Please upgrade to continue.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add http:// if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }
    
    setIsLoading(true);

    try {
      console.log(`Extracting content from URL: ${processedUrl}`);
      
      const extractedContent = await extractContentFromUrl(processedUrl, user?.id, true);
      
      if (!extractedContent || !extractedContent.content || extractedContent.content.trim() === '') {
        throw new Error("Failed to extract any content from the website.");
      }
      
      // Check if this is simulated content
      const contentIsSimulated = extractedContent.content.includes('simulated content') || 
                               extractedContent.content.includes('⚠️ NOTE:');
      setIsSimulatedContent(contentIsSimulated);
      
      // Show complete preview of extracted content
      setPreviewContent(extractedContent.content);
      
      // Store the extracted content in sessionStorage
      sessionStorage.setItem('readerContent', extractedContent.content);
      sessionStorage.setItem('contentTitle', extractedContent.title || 'Website content');
      sessionStorage.setItem('contentSource', extractedContent.sourceUrl || processedUrl);
      
      // Note: Usage is now tracked in the backend API, so we don't need to record it here
      
      const toastMessage = contentIsSimulated 
        ? "Using simulated content because the extraction API couldn't access the website."
        : `Successfully extracted ${extractedContent.content.length} characters of content.`;
      
      toast({
        title: contentIsSimulated ? "Using simulated content" : "Content extracted",
        description: toastMessage,
        variant: contentIsSimulated ? "default" : "default",
      });
      
      // Automatically navigate to the reader page after successful extraction
      const contentId = `website-${Date.now()}`;
      navigate(`/reader/${contentId}`);
      
      setIsLoading(false);

      // Invalidate queries after successful extraction to refresh usage count
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.usage(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionWithUsage(user.id) });
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setApiError(error instanceof Error ? error.message : "Failed to extract content");
      
      toast({
        title: "Error",
        description: "Failed to extract content from the website. Using fallback mode.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AlertMessages 
        apiError={apiError} 
        isSimulatedContent={isSimulatedContent}
      />

      {/* Usage limit warning */}
      {isAtLimit && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-3">
              <div>
                <strong>Usage Limit Reached!</strong> You've used all {usageLimit} books in your {tierName} tier this month.
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {isSubscribed ? (
                  <Link to="/account">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Crown className="mr-1 h-3 w-3" />
                      Upgrade Subscription
                    </Button>
                  </Link>
                ) : (
                  <SubscribeButton 
                    className="bg-red-600 hover:bg-red-700"
                    tier="starter"
                  >
                    <Crown className="mr-1 h-3 w-3" />
                    Subscribe Now
                  </SubscribeButton>
                )}
                <Link to="/account">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    View Usage Details
                  </Button>
                </Link>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage near limit warning */}
      {isNearLimit && !isAtLimit && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>Usage Warning:</strong> You've used {currentUsage} of {usageLimit} books in your {tierName} tier this month. 
            Only {remainingUsage} books remaining.
            {!isSubscribed && (
              <div className="mt-2">
                <SubscribeButton 
                  className="bg-orange-600 hover:bg-orange-700"
                  tier="starter"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Upgrade to Continue Reading
                </SubscribeButton>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <WebsiteInput url={url} setUrl={setUrl} />
      
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-gray-500">
          Enter the URL of the website you want to read
          {user && (
            <span className="ml-2 text-xs text-gray-400">
              ({currentUsage}/{usageLimit === 999999 ? '∞' : usageLimit} books used this month)
            </span>
          )}
        </p>
        
        {isAtLimit ? (
          <Button 
            disabled 
            type="button"
            className="opacity-50 cursor-not-allowed"
            title={`Usage limit reached for ${tierName} tier`}
          >
            Extract Content
          </Button>
        ) : (
          <SubmitButton 
            isLoading={isLoading}
          />
        )}
      </div>
      
      {previewContent && (
        <div className="mt-6">
          <ContentPreview content={previewContent} />
        </div>
      )}
      
      <ExamplesList setUrl={setUrl} />
    </form>
  );
};

export default WebsiteForm;
