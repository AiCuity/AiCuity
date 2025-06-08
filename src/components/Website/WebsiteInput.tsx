import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WebsiteInputProps = {
  url: string;
  setUrl: (url: string) => void;
};

const WebsiteInput = ({ url, setUrl }: WebsiteInputProps) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <Label htmlFor="website-url" className="text-sm sm:text-base font-medium">
        Website URL
      </Label>
      <div className="flex">
        <div className="relative flex-grow">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Globe className="h-4 w-4 flex-shrink-0" />
          </div>
          <Input
            id="website-url"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="pl-10 w-full text-sm sm:text-base h-10 sm:h-11"
            autoComplete="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
        Enter the URL with http(s):// prefix
      </p>
    </div>
  );
};

export default WebsiteInput;
