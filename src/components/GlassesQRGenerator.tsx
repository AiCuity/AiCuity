import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Loader, Copy, CheckCircle, Glasses } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface GlassesQRGeneratorProps {
  contentId: string;
  title: string;
}

interface GlassesTokenResponse {
  success: boolean;
  token: string;
  glassesUrl: string;
  expiresIn: string;
  contentTitle: string;
}

const GlassesQRGenerator = ({ contentId, title }: GlassesQRGeneratorProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [glassesData, setGlassesData] = useState<GlassesTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateGlassesUrl = async () => {
    if (!user) {
      setError('You must be logged in to generate glasses access');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/glasses/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          contentId: contentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate glasses access');
      }

      const data: GlassesTokenResponse = await response.json();
      setGlassesData(data);
    } catch (err) {
      console.error('Error generating glasses URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate glasses access');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (glassesData?.glassesUrl) {
      try {
        await navigator.clipboard.writeText(glassesData.glassesUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const generateQRCodeDataUrl = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 mb-4"
        >
          <Glasses className="mr-2 h-4 w-4" />
          View on Glasses
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            AR Glasses Access
          </DialogTitle>
          <DialogDescription>
            Generate a secure link to view "{title}" on your AR glasses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!glassesData && !error && (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click the button below to generate a secure access link for your AR glasses.
              </p>
              <Button 
                onClick={generateGlassesUrl} 
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate Glasses Access
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {glassesData && (
            <div className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Glasses access generated successfully! Link expires in {glassesData.expiresIn}.
                </AlertDescription>
              </Alert>

              {/* QR Code */}
              <div className="text-center">
                <img 
                  src={generateQRCodeDataUrl(glassesData.glassesUrl)}
                  alt="QR Code for glasses access"
                  className="mx-auto mb-4 border rounded-lg"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your AR glasses
                </p>
              </div>

              {/* URL Copy */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Direct Link:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={glassesData.glassesUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 font-mono"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  How to use:
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. Scan the QR code with your AR glasses or copy the link</li>
                  <li>2. Open the link in your glasses' web browser</li>
                  <li>3. The content will load automatically - no login required</li>
                  <li>4. Use the font controls to adjust text size as needed</li>
                </ol>
              </div>

              <Button 
                onClick={() => {
                  setGlassesData(null);
                  setError(null);
                }}
                variant="outline" 
                className="w-full"
              >
                Generate New Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlassesQRGenerator; 