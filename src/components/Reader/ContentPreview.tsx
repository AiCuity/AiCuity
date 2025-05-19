
import React from "react";
import ReactMarkdown from "react-markdown";

interface ContentPreviewProps {
  content: string;
}

const ContentPreview = ({ content }: ContentPreviewProps) => {
  // Clean any remaining HTML tags and format the content better
  const cleanContent = content
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Fix HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Convert plain text to markdown-friendly format
  const formattedContent = cleanContent
    // Replace double line breaks with markdown paragraph breaks
    .replace(/\n\n/g, '\n\n')
    // Ensure headers have proper spacing
    .replace(/\n(#+\s)/g, '\n\n$1');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        {(cleanContent.includes('##') || cleanContent.includes('#')) ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>
              {cleanContent.length > 5000 ? `${cleanContent.substring(0, 5000)}...\n\n*[Content truncated for preview, full content available when reading]*` : cleanContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm">
            {cleanContent.substring(0, 5000)}
            {cleanContent.length > 5000 && '...\n\n[Content truncated for preview, full content available when reading]'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
