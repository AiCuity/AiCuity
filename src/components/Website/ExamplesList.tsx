
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

type ExamplesListProps = {
  setUrl: (url: string) => void;
};

const ExamplesList = ({ setUrl }: ExamplesListProps) => {
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const examples = [
    "https://en.wikipedia.org/wiki/Speed_reading", 
    "https://en.wikipedia.org/wiki/Ninja",
    "https://www.bbc.com/news/world",
    "https://medium.com/topic/technology"
  ];

  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium mb-2">Popular Examples</h3>
      <div className="space-y-2">
        {examples.map((example) => (
          <div key={example} className="flex justify-between items-center">
            <button
              type="button"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => setUrl(example)}
            >
              {example}
            </button>
            <button 
              type="button"
              onClick={() => openInNewTab(example)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExamplesList;
