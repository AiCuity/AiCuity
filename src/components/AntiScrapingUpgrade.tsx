import { Shield, Crown, ExternalLink, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubscribeButton from "./SubscribeButton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AntiScrapingUpgradeProps {
  url: string;
  onClose?: () => void;
}

const AntiScrapingUpgrade = ({ url, onClose }: AntiScrapingUpgradeProps) => {
  const domain = new URL(url).hostname;

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              Website Protected from Scraping
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              <span className="font-medium">{domain}</span> uses anti-scraping protection (like Cloudflare) 
              that prevents our standard scraping method from working.
            </p>
          </div>
        </div>

        {/* Features explanation */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-2">
              <p className="font-medium">BASIC Plan includes advanced scraping capabilities:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Bypasses Cloudflare and other anti-scraping protections</li>
                <li>• JavaScript rendering for dynamic content</li>
                <li>• Access to protected news sites and blogs</li>
                <li>• Higher success rate on complex websites</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <SubscribeButton 
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            tier="basic"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to BASIC Plan
          </SubscribeButton>
          
          <Button 
            variant="outline" 
            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-900/20"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Site Directly
          </Button>
        </div>

        {/* Dismissal option */}
        {onClose && (
          <div className="pt-2 border-t border-orange-200 dark:border-orange-700">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              Try Different URL
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AntiScrapingUpgrade; 