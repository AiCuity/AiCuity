import React from "react";
import ReactMarkdown from "react-markdown";

interface ContentPreviewProps {
  content: string;
}

const ContentPreview = ({ content }: ContentPreviewProps) => {
  // Enhanced cleaning of content to remove problematic characters and format better
  const cleanContent = content
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Fix HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Remove non-printable and control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Fix multiple line breaks (more than 2) to just double line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove brackets with numbers (citation references)
    .replace(/\[\d+\]/g, '')
    // Remove references and citation markers with various formats
    .replace(/\[citation needed\]/gi, '')
    .replace(/\[edit\]/gi, '')
    .replace(/\[note \d+\]/gi, '')
    .replace(/\[ref\]/gi, '')
    // Clean up Unicode replacement characters and question marks in boxes
    .replace(/�/g, '')
    .replace(/\uFFFD/g, '')
    // Remove strange character combinations that often appear in extracted text
    .replace(/\\u[\dA-Fa-f]{4}/g, '')
    .replace(/\\x[\dA-Fa-f]{2}/g, '')
    // Remove CSS class definitions and style information
    .replace(/\.mw-parser-output[^}]+}/g, '')
    .replace(/\.[a-zA-Z0-9_-]+{[^}]*}/g, '')
    // Clean up parenthetical CSS classes
    .replace(/\([^)]*\.mw-[^)]*\)/g, '')
    // Preserve legitimate parenthetical foreign language terms (like Japanese)
    // but clean up CSS contamination within them
    .replace(/\(([^()]*?\.mw-[^()]*?)\)/g, match => {
      const inner = match.slice(1, -1);
      // If it contains foreign characters, clean it and keep only the relevant text
      if (/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(inner)) {
        const cleaned = inner.replace(/\.mw-[^,)]*,?/g, '').trim();
        return cleaned ? `(${cleaned})` : '';
      }
      // Otherwise remove the whole thing
      return '';
    })
    .trim();

  // Convert plain text to markdown-friendly format for better rendering
  const formattedContent = cleanContent
    // Replace double line breaks with markdown paragraph breaks
    .replace(/\n\n/g, '\n\n')
    // Ensure headers have proper spacing
    .replace(/\n(#+\s)/g, '\n\n$1')
    // Fix list items to ensure they render properly
    .replace(/\n- /g, '\n\n- ');

  // Check if this is simulated content
  const isSimulatedContent = cleanContent.includes('simulated content') || 
                            cleanContent.includes('⚠️ NOTE:') ||
                            cleanContent.includes('Connection Issue');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Content Preview</h2>
      
      {isSimulatedContent && (
        <div className="mb-3 sm:mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200">
          <p className="text-sm font-medium">
            ⚠️ This is simulated content. The actual website content could not be extracted.
          </p>
          <p className="text-xs mt-1">
            This may be due to CORS restrictions, network issues, or the content extraction API being unavailable.
          </p>
        </div>
      )}
      
      <div className="h-64 sm:h-80 md:max-h-[calc(100vh-400px)] overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        {(cleanContent.includes('##') || cleanContent.includes('#')) ? (
          <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
            <ReactMarkdown>
              {formattedContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
            {cleanContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
