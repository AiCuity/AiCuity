
import React from "react";
import ReactMarkdown from "react-markdown";

interface ContentPreviewProps {
  content: string;
}

const ContentPreview = ({ content }: ContentPreviewProps) => {
  // Convert plain text to markdown-friendly format by adding proper line breaks
  const formattedContent = content
    // Replace double line breaks with markdown paragraph breaks
    .replace(/\n\n/g, '\n\n')
    // Ensure headers have proper spacing
    .replace(/\n(#+\s)/g, '\n\n$1');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
      <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        {content.includes('##') || content.includes('#') ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>
              {content.length > 1500 ? `${content.substring(0, 1500)}...\n\n*[Content truncated for preview]*` : content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm">
            {content.substring(0, 1500)}
            {content.length > 1500 && '...\n\n[Content truncated for preview]'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
