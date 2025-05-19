
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WebsiteInputProps = {
  url: string;
  setUrl: (url: string) => void;
};

const WebsiteInput = ({ url, setUrl }: WebsiteInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="website-url">Website URL</Label>
      <div className="flex">
        <div className="relative flex-grow">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Globe className="h-4 w-4" />
          </div>
          <Input
            id="website-url"
            type="text"
            placeholder="example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="pl-10 w-full"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Enter the URL with or without http(s):// prefix
      </p>
    </div>
  );
};

export default WebsiteInput;
