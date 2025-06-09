import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Crown, Upload as UploadIcon, Globe, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractContentFromUrl } from "@/utils/contentExtractor";
import { validateFile } from "@/utils/fileValidation";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { calculateTotalWords } from "@/hooks/readingHistory/utils/progressUtils";
import { useAuth } from "@/context/AuthContext";

// Import themed icons
import frankIcon from "/assets/frankenstein.svg";
import gatsbyIcon from "/assets/gatsby.svg";
import uploadIcon from "/assets/upload.svg";

const LandingPage = () => {
  const [urlInput, setUrlInput] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { processFile, isLoading: isFileLoading } = useFileProcessor();
  const { user } = useAuth();

  // Example URLs for the landing page
  const exampleUrls = [
    "https://en.wikipedia.org/wiki/Speed_reading",
    "https://blog.medium.com/how-to-read-faster",
    "https://www.gutenberg.org/files/74/74-h/74-h.htm",
    "https://news.ycombinator.com/"
  ];

  const handleExampleBook = async (bookName: string) => {
    try {
      // For signed users, use the existing EPUB logic
      if (user) {
        const fileName = bookName === "FRANK" ? "Frankenstein.epub" : "Gatsby.epub";
        const response = await fetch(`/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${bookName}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: "application/epub+zip" });
        
        toast({
          title: "Loading Book",
          description: `Processing ${bookName === "FRANK" ? "Frankenstein" : "The Great Gatsby"}...`,
          variant: "default",
        });

        // Process the file like a regular upload
        try {
          const contentId = await processFile(file);
          
          // Store additional metadata for the example book
          sessionStorage.setItem('isExampleBook', 'true');
          sessionStorage.setItem('exampleBookName', bookName);
          
          // Navigate to the reader
          navigate(`/reader/${contentId}`);
          
        } catch (error) {
          console.error('Error processing example book:', error);
          toast({
            title: "Error",
            description: `Failed to process ${bookName}. Please try again.`,
            variant: "destructive",
          });
        }
      } else {
        // For un-signed users, load the txt files
        const fileName = bookName === "FRANK" ? "frank.txt" : "gatsby.txt";
        const response = await fetch(`/files/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${bookName}`);
        }
        
        const textContent = await response.text();
        
        if (!textContent || textContent.trim() === '') {
          throw new Error("Failed to load book content.");
        }
        
        toast({
          title: "Loading Book",
          description: `Loading ${bookName === "FRANK" ? "Frankenstein" : "The Great Gatsby"}...`,
          variant: "default",
        });
        
        // Calculate total words
        const totalWords = calculateTotalWords(textContent);
        
        // Store the content and metadata
        const bookTitle = bookName === "FRANK" ? "Frankenstein" : "The Great Gatsby";
        sessionStorage.setItem('readerContent', textContent);
        sessionStorage.setItem('contentTitle', bookTitle);
        sessionStorage.setItem('contentSource', `Example Book: ${bookTitle}`);
        sessionStorage.setItem('contentTotalWords', totalWords.toString());
        sessionStorage.setItem('isExampleBook', 'true');
        sessionStorage.setItem('exampleBookName', bookName);
        
        toast({
          title: "Book Loaded",
          description: `Successfully loaded ${bookTitle} with ${totalWords} words.`,
          variant: "default",
        });
        
        // Navigate to reader
        const contentId = `example-book-${bookName.toLowerCase()}-${Date.now()}`;
        sessionStorage.setItem('currentContentId', contentId);
        navigate(`/reader/${contentId}`);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load ${bookName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For un-signed users, redirect to login instead of processing
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upload files. You can still try our example books!",
        variant: "default",
      });
      navigate("/login");
      return;
    }

    // Validate file for signed users
    const validation = validateFile(file, user as any);
    
    if (!validation.isValid) {
      toast({
        title: "File Error",
        description: validation.error!,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "File Selected",
      description: `Selected: ${file.name}`,
      variant: "default",
    });
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    // This should only be reachable by signed users
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const contentId = await processFile(selectedFile);
      
      // Store that this is a signed user upload
      sessionStorage.setItem('isSignedUserUpload', 'true');
      
      // Navigate to the reader
      navigate(`/reader/${contentId}`);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urlInput.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Add http:// if missing
    let processedUrl = urlInput;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      processedUrl = 'https://' + urlInput;
    }
    
    setIsUrlLoading(true);

    try {
      toast({
        title: "Extracting Content",
        description: "Processing the website content...",
        variant: "default",
      });

      const extractedContent = await extractContentFromUrl(processedUrl, user?.id, !user);
      
      if (!extractedContent || !extractedContent.content || extractedContent.content.trim() === '') {
        throw new Error("Failed to extract any content from the website.");
      }
      
      // Calculate total words
      const totalWords = calculateTotalWords(extractedContent.content);
      
      // Store the extracted content and metadata
      sessionStorage.setItem('readerContent', extractedContent.content);
      sessionStorage.setItem('contentTitle', extractedContent.title || 'Website content');
      sessionStorage.setItem('contentSource', extractedContent.sourceUrl || processedUrl);
      sessionStorage.setItem('contentTotalWords', totalWords.toString());
      
      // Set appropriate session flag based on user status
      if (user) {
        sessionStorage.setItem('isSignedUserUrl', 'true');
      } else {
        sessionStorage.setItem('isGuestUrl', 'true');
      }
      
      toast({
        title: "Content Extracted",
        description: `Successfully extracted ${totalWords} words from the website.`,
        variant: "default",
      });
      
      // Navigate to reader
      const contentId = `website-${Date.now()}`;
      sessionStorage.setItem('currentContentId', contentId);
      navigate(`/reader/${contentId}`);
      
    } catch (error) {
      console.error('Error extracting URL:', error);
      toast({
        title: "Extraction Error",
        description: "Failed to extract content from the website. Please try a different URL.",
        variant: "destructive",
      });
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleExampleUrl = (url: string) => {
    setUrlInput(url);
  };

  // Helper function to handle upload click for un-signed users
  const handleUploadClick = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upload files. You can still try our example books!",
        variant: "default",
      });
      navigate("/login");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* FRANK Book */}
        <Card 
          className="flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 border-emerald-200 dark:border-emerald-700"
          onClick={() => handleExampleBook("FRANK")}
        >
          <div className="mb-4">
            <img 
              src={frankIcon} 
              alt="Frankenstein" 
              className="h-12 w-12 sm:h-16 sm:w-16 mx-auto transition-opacity duration-200" 
            />
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Try Frankenstein
          </p>
        </Card>

        {/* GATSBY Book */}
        <Card 
          className="flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-cyan-50 to-fuchsia-100 dark:from-cyan-900/30 dark:to-fuchsia-800/30 border-cyan-200 dark:border-cyan-700"
          onClick={() => handleExampleBook("GATSBY")}
        >
          <div className="mb-4">
            <img 
              src={gatsbyIcon} 
              alt="The Great Gatsby" 
              className="h-12 w-12 sm:h-16 sm:w-16 mx-auto transition-opacity duration-200" 
            />
          </div>
          <p className="text-sm text-cyan-700 dark:text-cyan-300">
            Try The Great Gatsby
          </p>
        </Card>

        {/* Upload */}
        <Card className="flex flex-col items-center justify-center cursor-pointer p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-violet-100 dark:from-blue-900/30 dark:to-violet-800/30 border-blue-200 dark:border-blue-700" onClick={handleUploadClick}>
          <div className="mb-4">
          <img 
              src={uploadIcon} 
              alt="Upload" 
              className="h-12 w-12 sm:h-16 sm:w-16 mx-auto transition-opacity duration-200" 
            />
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Upload your files
          </p>
          
          {/* File input - only show for signed users */}
          {user && (
            <div className="space-y-3">
              <input
                type="file"
                accept=".epub,.pdf,.txt,.docx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/50 dark:file:text-purple-300"
              />
              
              {selectedFile && (
                <div className="text-xs text-purple-600 dark:text-purple-300">
                  Selected: {selectedFile.name}
                </div>
              )}
              
              {selectedFile && (
                <Button
                  onClick={handleFileSubmit}
                  disabled={isFileLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2"
                >
                  {isFileLoading ? "Processing..." : "Read File"}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* OR URL Section */}
      <div className="text-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
              OR URL
            </span>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <Card className="p-4 sm:p-6 mb-6">
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="url"
                placeholder="Enter website URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="pl-10 text-sm sm:text-base"
                disabled={isUrlLoading}
              />
            </div>
            <Button 
              type="submit"
              disabled={isUrlLoading}
              className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6"
            >
              {isUrlLoading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">...</span>
                </span>
              ) : (
                <>
                  <span className="hidden sm:inline">Read URL</span>
                  <span className="sm:hidden">Read</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Examples */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          EXAMPLES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exampleUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => handleExampleUrl(url)}
              className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              {url}
            </button>
          ))}
        </div>
      </Card>

      {/* Try for Free CTA - only show for non-signed users */}
      {/* {!user && (
        <Card className="w-full max-w-3xl mx-auto mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-200">
                Enjoying the Experience?
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                Sign up for free to save your reading history and unlock more features
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => navigate("/register")}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                <Crown className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Sign Up Free</span>
              </Button>
            </div>
          </div>
        </Card>
      )} */}
    </div>
  );
};

export default LandingPage; 