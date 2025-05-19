
export function generateWikipediaArticle(title: string): string {
  if (title.toLowerCase() === 'ninja') {
    return `# Ninja

## Overview
A ninja (忍者) was a covert agent or mercenary in feudal Japan who specialized in unorthodox warfare. The functions of the ninja included reconnaissance, espionage, infiltration, deception, ambush, and their fighting skills in martial arts, including ninjutsu.

## History
The ninja emerged as mercenaries in the 15th century during the Sengoku period of feudal Japan, but antecedents may have existed as early as the 12th century. In the unrest of the Sengoku period, mercenaries and spies for hire infiltrated enemy territories to gather intelligence on enemy terrain, building specifications, and troop numbers and to carry out assassinations.

The skills required of the ninja warrior included:
- Disguise and impersonation
- Stealth and entering techniques
- Geography and meteorology
- Medicines and poisons
- Kenjutsu (sword techniques)
- Tactics and espionage

## Cultural Significance
The image of the ninja has been widely used in popular culture, particularly in video games, anime, and movies. The portrayal of ninja skills, such as walking on water or becoming invisible, have become exaggerated in fiction since the emergence of ninja in popular culture in the 1950s and 1960s.

### Famous Ninja Clans
- Iga Clan
- Kōga Clan
- Fūma Clan

### Weapons and Equipment
Ninjas were known to use various weapons and tools:
1. Shuriken (throwing stars)
2. Kunai (multi-purpose knife)
3. Kusarigama (chain-sickle)
4. Smoke bombs
5. Climbing equipment

## Modern Interpretations
Today, the ninja remains a cultural icon, appearing in everything from children's cartoons to serious historical studies. Training in ninjutsu, the martial art of the ninja, continues in various schools around the world, though many historians debate the authenticity of these modern interpretations.`;
  }
  
  if (title.toLowerCase() === 'speed reading') {
    return `# Speed Reading

## Overview
Speed reading is a collection of reading methods which attempt to increase rates of reading without greatly reducing comprehension or retention. Methods include chunking and minimizing subvocalization.

## Techniques
Several techniques are used in speed reading:

### Skimming
Skimming involves getting the essence of material without reading all the words. The reader looks for main ideas, key words, and important details while passing over less important information.

### Chunking
Chunking involves reading groups of words together rather than one word at a time. This reduces the number of eye movements and fixations, potentially increasing reading speed.

### Reducing Subvocalization
Many readers "hear" the words they read in their mind, a process called subvocalization. Speed reading techniques often aim to reduce this habit, as it can limit reading speed to speaking speed.

### Meta Guiding
Using a pointer (finger or pen) to guide the eye down the page can increase focus and reading speed by reducing regression (re-reading) and maintaining a steady pace.

## Scientific Research
Research on speed reading has shown mixed results:

- Some studies show that comprehension decreases as reading speed increases beyond certain thresholds
- The brain has physiological limitations on how quickly it can process text
- Claims of extreme reading speeds (over 1000+ words per minute) with full comprehension are generally unsupported by scientific evidence

## Applications
Speed reading techniques are often taught for:
- Academic purposes
- Professional development
- Information processing in data-heavy environments
- Recreational reading of non-critical materials

## Notable Speed Reading Systems
- The Evelyn Wood Reading Dynamics program
- PhotoReading by Paul Scheele
- Speed Reading 4 Kids by George Stancliffe

## Criticism
Critics argue that:
1. True comprehension requires deeper processing that can't be rushed
2. Different types of text require different reading approaches
3. Many speed reading claims are exaggerated or pseudoscientific`;
  }
  
  // Generate common sections for a Wikipedia article with the specific title
  return `# ${title}

## Overview
This is simulated content for the Wikipedia article about ${title}. In reality, this content would include comprehensive information compiled by Wikipedia editors.

## History
The history of ${title} spans several significant periods:

- Early developments and origins
- Major historical milestones
- Evolution over time
- Modern developments and current status

## Characteristics
Key features and characteristics of ${title} include:

1. Defining attributes and properties
2. Classifications and categories
3. Variations and types
4. Related concepts and phenomena

## Cultural Significance
${title} has made significant impacts in various domains:

- Historical importance and influence
- Presence in media and popular culture
- Scientific or academic relevance
- Social and cultural implications

## References
This section would contain citations from academic sources, books, articles, and other references verifying the information presented.

## Further Reading
- Books about ${title}
- Academic papers
- Related Wikipedia articles
- External websites`;
}
