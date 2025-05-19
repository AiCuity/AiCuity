
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
                <p className="text-xs text-gray-500">
                  Your API key is stored locally and never sent to our servers.
                </p>
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
