import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ContentPreview from "@/components/Reader/ContentPreview";
import { useAuth } from '@/context/AuthContext';
import { validateFile } from '@/utils/fileValidation';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import FileInput from '@/components/FileUpload/FileInput';
import ProgressDisplay from '@/components/FileUpload/ProgressDisplay';
import ErrorDisplay from '@/components/FileUpload/ErrorDisplay';
import SubmitButton from '@/components/FileUpload/SubmitButton';
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertTriangle, TrendingUp } from "lucide-react";
import SubscribeButton from "./SubscribeButton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api';

const FileUploadNetlify = () => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isLoading,
    apiError,
    previewContent,
    msg,
    processFile,
    setMsg,
    setApiError,
    setPreviewContent
  } = useFileProcessor();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check usage limit first
    if (isAtLimit) {
      setMsg(`Usage limit reached! You've used all ${usageLimit} books in your ${tierName} tier this month.`);
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your ${tierName} tier limit. Please upgrade to continue.`,
        variant: "destructive",
      });
      return;
    }

    const validation = validateFile(selectedFile, user);
    
    if (!validation.isValid) {
      setMsg(validation.error!);
      toast({
        title: "Error",
        description: validation.error!,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setMsg(undefined);
    setApiError(null);
    setPreviewContent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to upload files",
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

    try {
      const contentId = await processFile(file);
      
      // Note: Usage is now tracked in the backend API during file processing, so we don't need to record it here
      
      // Navigate to the reader page after successful processing
      navigate(`/reader/${contentId}`);
      
      // Invalidate queries after successful file upload to refresh usage count
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.usage(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionWithUsage(user.id) });
      }
      
    } catch (error) {
      // Error handling is already done in processFile
      console.error('Error processing file:', error);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">File Upload Information</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Text files (.txt) are processed directly in your browser</p>
          <p>• PDF and EPUB files require server-side processing (coming soon)</p>
          <p>• Files are uploaded to secure Supabase storage</p>
          <p>• Max size limit to 5MB</p>
          {user && (
            <p className="font-medium">
              • Usage: {currentUsage}/{usageLimit === 999999 ? '∞' : usageLimit} books used this month ({tierName} tier)
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FileInput
          onFileChange={handleFileChange}
          file={file}
          isLoading={isLoading}
          msg={msg}
        />
        
        <ProgressDisplay isLoading={isLoading} />
        
        <ErrorDisplay apiError={apiError} />
        
        {previewContent && (
          <div className="mt-6">
            <ContentPreview content={previewContent} />
          </div>
        )}
        
        {isAtLimit ? (
          <Button 
            disabled 
            type="button"
            className="w-full opacity-50 cursor-not-allowed"
            title={`Usage limit reached for ${tierName} tier`}
          >
            Upload File (Limit Reached)
          </Button>
        ) : (
          <SubmitButton isLoading={isLoading} hasFile={!!file} />
        )}
      </form>
    </div>
  );
};

export default FileUploadNetlify;
