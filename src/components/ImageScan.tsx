import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertTriangle, TrendingUp, Camera, Loader2 } from "lucide-react";
import SubscribeButton from "./SubscribeButton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api';
const API_BASE = import.meta.env.VITE_API_URL;

const ImageScan = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  
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

  const validateImageFile = (file: File) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported image type: ${file.type}. Please upload JPG, PNG, GIF, WebP, BMP, TIFF, or SVG files.`
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Image file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 10MB.`
      };
    }

    return { isValid: true };
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    } else if (kb >= 1) {
      return `${kb.toFixed(1)} KB`;
    } else {
      return `${bytes} bytes`;
    }
  };

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

    const validation = validateImageFile(selectedFile);
    
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
    setSummary("");
  };

  const scanImage = async (imageFile: File): Promise<{ summary: string; originalFilename: string }> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    if (user?.id) {
      formData.append('userId', user.id);
    }

    try {
      console.log(`Scanning image: ${imageFile.name} (${imageFile.size} bytes)`);
      console.log(`Using endpoint: ${API_BASE}/image-scan`);
      
      const response = await fetch(`${API_BASE}/image-scan`, {
        method: 'POST',
        body: formData,
      });
      
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `Failed to scan image: ${response.status} ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          
          if (errorText.startsWith('{')) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (!responseText.startsWith('{')) {
        throw new Error('Server returned invalid response format. Expected JSON but got: ' + responseText.substring(0, 100));
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Unknown error occurred');
      }
      
      if (!data.summary || data.summary.trim() === '') {
        throw new Error("Failed to generate summary from the image.");
      }

      console.log(`Successfully scanned image: ${data.summary.length} characters in summary`);
      return {
        summary: data.summary,
        originalFilename: data.originalFilename || imageFile.name
      };
      
    } catch (error) {
      console.error('Error scanning image:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the image scanning service. Please try again or contact support if the issue persists.');
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image to scan",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to scan images",
        variant: "destructive",
      });
      return;
    }

    if (!canUseFeature) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your ${tierName} tier limit of ${usageLimit} books this month. Please upgrade to continue.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setMsg(undefined);

    try {
      const result = await scanImage(file);
      
      // Create a content ID for the scanned content
      const contentId = crypto.randomUUID();
      
      // Calculate total words for the summary
      const totalWords = result.summary.split(/\s+/).filter(word => word.length > 0).length;
      
      // Store content in sessionStorage for the reader
      sessionStorage.setItem('readerContent', result.summary);
      sessionStorage.setItem('contentTitle', `Book Scan: ${result.originalFilename}`);
      sessionStorage.setItem('contentSource', `Image Scan: ${result.originalFilename}`);
      sessionStorage.setItem('contentTotalWords', totalWords.toString());
      sessionStorage.setItem('contentSummary', result.summary);
      
      // Clear any existing session storage that might interfere
      sessionStorage.removeItem('currentContentId');
      sessionStorage.removeItem('isExistingContent');
      
      console.log("DEBUG ImageScan: Stored content in sessionStorage:");
      console.log("  - readerContent length:", result.summary.length);
      console.log("  - contentTitle:", `Book Scan: ${result.originalFilename}`);
      console.log("  - contentSource:", `Image Scan: ${result.originalFilename}`);
      console.log("  - contentTotalWords:", totalWords);
      
      // Store the scanned content in localStorage as backup
      const contentData = {
        text: result.summary,
        title: `Book Scan: ${result.originalFilename}`,
        source: `Image Scan: ${result.originalFilename}`,
        timestamp: Date.now(),
        type: 'image-scan'
      };
      
      localStorage.setItem(`content_${contentId}`, JSON.stringify(contentData));
      
      toast({
        title: "Success",
        description: "Image scanned successfully! Redirecting to reader...",
        variant: "default",
      });
      
      console.log("DEBUG ImageScan: Stored content data:");
      console.log("  - contentId:", contentId);
      console.log("  - title:", `Book Scan: ${result.originalFilename}`);
      console.log("  - source:", `Image Scan: ${result.originalFilename}`);
      console.log("  - totalWords:", totalWords);
      
      // Navigate to the reader page after successful scanning
      navigate(`/reader/${contentId}`);
      
      // Invalidate queries after successful image scan to refresh usage count
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.usage(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionWithUsage(user.id) });
      }
      
    } catch (error) {
      console.error('Error scanning image:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to scan the image";
      setApiError(errorMessage);
      setMsg(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">Image Scan Information</h3>
        <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 space-y-1">
          <p>• Upload book covers or text images for AI analysis</p>
          <p>• Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF, SVG</p>
          <p>• Maximum file size: 10MB</p>
          <p>• AI will generate a detailed book summary from the image</p>
          {user && (
            <p className="font-medium pt-1 border-t border-blue-200 dark:border-blue-700 mt-2">
              Usage: {currentUsage}/{usageLimit === 999999 ? '∞' : usageLimit} books used this month ({tierName} tier)
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* File Input */}
        <div className="space-y-3">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm sm:text-base text-gray-500 
                       file:mr-3 sm:file:mr-4 
                       file:py-2 sm:file:py-3 
                       file:px-3 sm:file:px-4 
                       file:rounded-lg file:border-0 
                       file:text-sm sm:file:text-base file:font-semibold 
                       file:bg-purple-50 file:text-purple-700 
                       hover:file:bg-purple-100 
                       dark:file:bg-purple-900/20 dark:file:text-purple-300
                       file:transition-colors file:cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            accept="image/*"
            disabled={isLoading}
          />
          {file && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                Selected image: {file.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Size: {formatFileSize(file.size)}
              </p>
            </div>
          )}
          
          {msg && (
            <div className={`mt-2 p-3 rounded-lg text-sm sm:text-base ${
              msg.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            }`}>
              {msg}
            </div>
          )}
        </div>
        
        {/* Progress Display */}
        {isLoading && (
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600 flex-shrink-0" />
              <p className="text-sm sm:text-base text-purple-700 dark:text-purple-300 font-medium">
                Scanning image with AI...
              </p>
            </div>
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
              Please wait while we analyze your image and generate a summary
            </p>
          </div>
        )}
        
        {/* Error Display */}
        {apiError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 border border-red-200 dark:border-red-800">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200">
                  There was an error scanning your image.
                </h3>
                <div className="mt-2 text-sm sm:text-base text-red-700 dark:text-red-300">
                  <p className="break-words">{apiError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        {isAtLimit ? (
          <Button 
            disabled 
            type="button"
            className="w-full opacity-50 cursor-not-allowed h-10 sm:h-11 text-sm sm:text-base"
            title={`Usage limit reached for ${tierName} tier`}
          >
            Scan Image (Limit Reached)
          </Button>
        ) : (
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-3 sm:py-2 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Scanning...</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Scan Image</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default ImageScan; 