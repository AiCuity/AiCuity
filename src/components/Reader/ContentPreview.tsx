
import React from "react";
import ReactMarkdown from "react-markdown";

interface ContentPreviewProps {
  content: string;
}

const ContentPreview = ({ content }: ContentPreviewProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
      <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        {content.startsWith('#') || content.includes('\n## ') ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>
              {content.length > 1000 ? `${content.substring(0, 1000)}...` : content}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {content.substring(0, 1000)}
            {content.length > 1000 && '...'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
