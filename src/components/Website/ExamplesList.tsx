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

  // Function to truncate URL for mobile display
  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <Card className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium mb-2 sm:mb-3">Popular Examples</h3>
      <div className="space-y-1 sm:space-y-2">
        {examples.map((example) => (
          <div key={example} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex-1 text-left text-sm text-blue-600 dark:text-blue-400 hover:underline focus:underline focus:outline-none min-w-0 py-1"
              onClick={() => setUrl(example)}
              title={example}
            >
              <span className="block sm:hidden truncate">
                {truncateUrl(example, 35)}
              </span>
              <span className="hidden sm:block truncate">
                {example}
              </span>
            </button>
            <button 
              type="button"
              onClick={() => openInNewTab(example)}
              className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExamplesList;
