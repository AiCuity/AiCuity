
export function generateDomainSpecificContent(hostname: string, path: string): string {
  // Choose content based on hostname or use default
  const topics: Record<string, string> = {
    'wikipedia.org': `# Simulated Wikipedia Article
      
This is simulated content for a Wikipedia article. The content extraction API is currently unavailable.

## Note
This is NOT actual content from Wikipedia. This is generated placeholder text because:
1. The content extraction API might be blocked by CORS policies
2. The server might be unavailable
3. The connection might have timed out

## About Wikipedia
Wikipedia is a free online encyclopedia created and edited by volunteers around the world.`,

    'bbc.com': `# Simulated BBC News Content
      
This is simulated content for BBC News. The content extraction API is currently unavailable.

## Note
This is NOT actual content from BBC. This is generated placeholder text because:
1. The content extraction API might be blocked by CORS policies
2. The server might be unavailable
3. The connection might have timed out`,

    'medium.com': `# Simulated Medium Article
      
This is simulated content for a Medium article. The content extraction API is currently unavailable.

## Note
This is NOT actual content from Medium. This is generated placeholder text because:
1. The content extraction API might be blocked by CORS policies
2. The server might be unavailable
3. The connection might have timed out`,

    'default': `# Simulated Website Content
      
This is simulated content for ${hostname}${path}. The content extraction API is currently unavailable.

## Connection Issue
There was a problem connecting to the content extraction service. This could be due to:
1. CORS policies blocking the API request
2. The API server being unavailable
3. Network connectivity issues

Try using a different URL or check back later.`
  };
  
  for (const [domain, content] of Object.entries(topics)) {
    if (hostname.includes(domain)) {
      return content;
    }
  }
  
  return topics.default;
}
