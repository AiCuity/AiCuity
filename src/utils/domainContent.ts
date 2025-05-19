
export function generateDomainSpecificContent(hostname: string, path: string): string {
  // Choose content based on hostname or use default
  const topics: Record<string, string> = {
    'wikipedia.org': `# Wikipedia Article
      
This is simulated content for a Wikipedia article. Wikipedia is a free online encyclopedia created and edited by volunteers around the world.

## Introduction
Wikipedia is a multilingual free online encyclopedia written and maintained by a community of volunteers, known as Wikipedians, through open collaboration and using a wiki-based editing system. Wikipedia is the largest and most-read reference work in history.

## Features
- Free content that anyone can edit
- Neutral point of view
- Verifiable information
- Multiple language editions
- Volunteer-driven content creation

## Usage
Wikipedia is widely used for research, education, and general knowledge. It's one of the most visited websites globally, with millions of articles spanning various subjects including history, science, arts, and current events.

## Reliability
While anyone can edit Wikipedia, the platform has developed robust mechanisms to maintain accuracy, including:
- Citation requirements
- Editorial oversight
- Vandalism detection
- Community peer review`,

    'bbc.com': `# BBC News
      
This is simulated content for a BBC News article.

## Headlines Today
- Global leaders meet to discuss climate change initiatives
- Economic outlook shows mixed signals for upcoming quarter
- Sports teams prepare for international championship
- Technology companies announce new product innovations
- Healthcare advances promise treatment breakthroughs

## Featured Article
The world's leading climate scientists have warned that global efforts to reduce carbon emissions are falling significantly short of targets needed to prevent catastrophic warming. According to the latest report, countries would need to triple their current commitments to limit warming to the internationally agreed threshold.

Environmental ministers from several nations have convened an emergency meeting to address these concerns and discuss potential solutions, including accelerated renewable energy adoption and stronger regulatory frameworks for high-emission industries.`,

    'medium.com': `# Medium Article
      
This is simulated content for a Medium technology article.

## The Future of AI Development
      
Artificial intelligence continues to evolve at a remarkable pace, transforming industries and creating new possibilities that were once confined to science fiction. As we navigate this rapidly changing landscape, it's crucial to understand both the technical advancements and their broader implications.

### Key Developments

**Foundation Models**
The emergence of large foundation models has revolutionized how we approach AI development. These models, trained on vast datasets using self-supervised learning techniques, demonstrate remarkable capabilities across various domains without task-specific training.

**Multimodal Learning**
Modern AI systems increasingly work across different forms of data - processing text, images, audio, and video in an integrated manner. This multimodal approach brings us closer to AI systems that can perceive the world more like humans do.

**Responsible AI**
As AI becomes more powerful, ensuring it operates according to human values becomes increasingly important. Researchers are developing methods to align AI systems with human preferences and make their decision-making processes more transparent and explainable.`,

    'default': `# Website Content
      
This is simulated content for ${hostname}${path}.

## Introduction
This is a placeholder text for content that would normally be extracted from the website you requested. Due to connection issues with our content extraction service, we're showing this generated text instead.

## Content
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.

## About This Website
The website you requested (${hostname}) appears to be about general information. This fallback content is generated when we cannot connect to our content extraction service. You can try again later or try a different URL.`
  };
  
  for (const [domain, content] of Object.entries(topics)) {
    if (hostname.includes(domain)) {
      return content;
    }
  }
  
  return topics.default;
}
