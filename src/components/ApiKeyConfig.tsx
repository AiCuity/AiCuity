
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { AlertCircle } from "lucide-react";

interface ApiKeyConfigProps {
  apiKey: string;
  useOpenAI: boolean;
  onApiKeyChange: (apiKey: string) => void;
  onUseOpenAIChange: (useOpenAI: boolean) => void;
}

const ApiKeyConfig = ({
  apiKey,
  useOpenAI,
  onApiKeyChange,
  onUseOpenAIChange
}: ApiKeyConfigProps) => {
  const [key, setKey] = useState(apiKey);
  const [showHelp, setShowHelp] = useState(false);
  
  const handleSave = () => {
    onApiKeyChange(key);
    // Also save to localStorage for persistence
    localStorage.setItem('openai_api_key', key);
  };
  
  const handleUseOpenAIChange = (checked: boolean) => {
    onUseOpenAIChange(checked);
    localStorage.setItem('use_openai', String(checked));
  };
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="config">
        <AccordionTrigger className="text-sm">
          Summarization Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Use OpenAI</Label>
                <p className="text-xs text-muted-foreground">
                  Use OpenAI for better summaries (requires API key)
                </p>
              </div>
              <Switch 
                checked={useOpenAI} 
                onCheckedChange={handleUseOpenAIChange}
              />
            </div>
            
            {useOpenAI && (
              <div className="space-y-2">
                <Label htmlFor="api_key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="Enter your OpenAI API key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                  <Button onClick={handleSave} size="sm">
                    Save
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 space-y-2">
                  <p>Your API key is stored locally and never sent to our servers.</p>
                  
                  <button 
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Having issues with your API key?
                  </button>
                  
                  {showHelp && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                      <p>If you're seeing errors with your API key:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Make sure your OpenAI account has available credits</li>
                        <li>Check if your account has billing issues</li>
                        <li>Verify you've copied the key correctly</li>
                        <li>Try creating a new API key in your OpenAI account</li>
                      </ul>
                      <a 
                        href="https://platform.openai.com/account/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline block mt-2"
                      >
                        Manage your OpenAI API keys
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!useOpenAI && (
              <p className="text-xs text-muted-foreground">
                Using free Hugging Face model for summarization.
                For best results, add an OpenAI API key.
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ApiKeyConfig;
