import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { extractContentFromUrl, AntiScrapingError } from "../utils/contentExtractor";
import ContentPreview from "@/components/Reader/ContentPreview";
import WebsiteInput from "./Website/WebsiteInput";
import ExamplesList from "./Website/ExamplesList";
import AlertMessages from "./Website/AlertMessages";
import SubmitButton from "./Website/SubmitButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertTriangle, TrendingUp, Shield, Lock } from "lucide-react";
import SubscribeButton from "./SubscribeButton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api';
import { calculateTotalWords } from "@/hooks/readingHistory/utils/progressUtils";

const WebsiteForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isSimulatedContent, setIsSimulatedContent] = useState(false);
  const [antiScrapingError, setAntiScrapingError] = useState<{
    message: string;
    protectionType: string;
    requiredTier: string;
  } | null>(null);
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
    setAntiScrapingError(null);
    
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
      
      // Calculate total words from the extracted content
      const totalWords = calculateTotalWords(extractedContent.content);
      console.log(`Calculated total words: ${totalWords} for content length: ${extractedContent.content.length}`);
      
      // Show complete preview of extracted content
      setPreviewContent(extractedContent.content);
      
      // Store the extracted content and metadata in sessionStorage
      sessionStorage.setItem('readerContent', extractedContent.content);
      sessionStorage.setItem('contentTitle', extractedContent.title || 'Website content');
      sessionStorage.setItem('contentSource', extractedContent.sourceUrl || processedUrl);
      sessionStorage.setItem('contentTotalWords', totalWords.toString()); // Store total words
      
      // Note: Usage is now tracked in the backend API, so we don't need to record it here
      
      const toastMessage = contentIsSimulated 
        ? "Using simulated content because the extraction API couldn't access the website."
        : `Successfully extracted ${extractedContent.content.length} characters of content (${totalWords} words).`;
      
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

      // Handle anti-scraping protection error specifically
      if (error instanceof AntiScrapingError) {
        setAntiScrapingError({
          message: error.message,
          protectionType: error.protectionType,
          requiredTier: error.requiredTier
        });
        
        toast({
          title: "Website Protected",
          description: error.message,
          variant: "default",
        });
        return; // Don't show fallback content or navigate
      }
      
      setApiError(error instanceof Error ? error.message : "Failed to extract content");
      
      toast({
        title: "Error",
        description: "Failed to extract content from the website. Using fallback mode.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <AlertMessages 
        apiError={apiError} 
        isSimulatedContent={isSimulatedContent}
      />

      {/* Anti-scraping protection alert */}
      {antiScrapingError && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-3">
              <div className="text-sm sm:text-base">
                <strong>Website Protected:</strong> {antiScrapingError.message}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300">
                Protection type: {antiScrapingError.protectionType} • Upgrade to {antiScrapingError.requiredTier} plan required
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="w-full sm:w-auto">
                  <SubscribeButton 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm"
                    tier="basic"
                  >
                    <Lock className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Upgrade to {antiScrapingError.requiredTier}</span>
                  </SubscribeButton>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto text-sm"
                  onClick={() => setAntiScrapingError(null)}
                >
                  Try Another URL
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage limit warning */}
      {isAtLimit && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-3">
              <div className="text-sm sm:text-base">
                <strong>Usage Limit Reached!</strong> You've used all {usageLimit} books in your {tierName} tier this month.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                {isSubscribed ? (
                  <Link to="/account" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm">
                      <Crown className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Upgrade Subscription</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="w-full sm:w-auto">
                    <SubscribeButton 
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm"
                      tier="starter"
                    >
                      <Crown className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Subscribe Now</span>
                    </SubscribeButton>
                  </div>
                )}
                <Link to="/account" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-sm">
                    <TrendingUp className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">View Usage Details</span>
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
          <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="text-sm sm:text-base">
              <strong>Usage Warning:</strong> You've used {currentUsage} of {usageLimit} books in your {tierName} tier this month. 
              Only {remainingUsage} books remaining.
            </div>
            {!isSubscribed && (
              <div className="mt-2 w-full sm:w-auto">
                <SubscribeButton 
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-sm"
                  tier="starter"
                >
                  <Crown className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Upgrade to Continue Reading</span>
                </SubscribeButton>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <WebsiteInput url={url} setUrl={setUrl} />
      
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 pt-2">
        <div className="text-sm text-gray-500 min-w-0">
          <p className="leading-relaxed">
            Enter the URL of the website you want to read
          </p>
          {user && (
            <p className="text-xs text-gray-400 mt-1">
              {currentUsage}/{usageLimit === 999999 ? '∞' : usageLimit} books used this month
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0 w-full sm:w-auto">
          {isAtLimit ? (
            <Button 
              disabled 
              type="button"
              className="w-full sm:w-auto opacity-50 cursor-not-allowed"
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
      </div>
      
      {previewContent && (
        <div className="mt-4 sm:mt-6">
          <ContentPreview content={previewContent} />
        </div>
      )}
      
      <ExamplesList setUrl={setUrl} />
    </form>
  );
};

export default WebsiteForm;
