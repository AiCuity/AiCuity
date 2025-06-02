import { fetchActualContent } from "./contentSource";
import { generateWikipediaArticle } from "./wikiContent";
import { generateDomainSpecificContent } from "./domainContent";
import { ExtractedContent } from "./types";

export async function generateFallbackContent(url: string): Promise<ExtractedContent> {
  // Try to fetch actual content directly from the source if possible
  try {
    // Note: incrementUsage is false because this is fallback content, not a new user request
    const actualContent = await fetchActualContent(url, undefined, false);
    if (actualContent) {
      return actualContent;
    }
  } catch (e) {
    console.log('Failed to fetch actual content, using generated content:', e);
  }
  
  // Extract hostname and path for more meaningful fallback content
  let hostname = 'example.com';
  let path = '';
  let title = 'Content';
  let pageTitle = '';
  
  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname;
    path = urlObj.pathname;
    title = hostname + (path !== '/' ? path : '');
    
    // Extract topic from Wikipedia URL
    if (hostname.includes('wikipedia.org')) {
      // Get the last part of the path which is usually the article title
      const pathSegments = path.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        // Replace underscores with spaces and decode URI component
        pageTitle = decodeURIComponent(pathSegments[pathSegments.length - 1].replace(/_/g, ' '));
      }
    }
  } catch (urlError) {
    console.error('URL parsing error:', urlError);
  }

  // For Wikipedia articles, generate content based on the specific article title
  if (hostname.includes('wikipedia.org') && pageTitle) {
    return {
      content: generateWikipediaArticle(pageTitle),
      title: `Content from ${title}`,
      sourceUrl: url
    };
  }

  // For other specific domains, use domain-specific templates
  const content = generateDomainSpecificContent(hostname, path);
  return {
    content,
    title: `Content from ${title}`,
    sourceUrl: url
  };
}
