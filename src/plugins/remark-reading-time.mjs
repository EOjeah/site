import readingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

// Astro's documented reading-time recipe, with an optional author override.
// https://docs.astro.build/en/recipes/reading-time/
export function remarkReadingTime() {
  return (tree, { data }) => {
    const minutes = data.astro.frontmatter.readingMinutes
      ?? Math.max(1, Math.ceil(readingTime(toString(tree)).minutes));
    data.astro.frontmatter.minutesRead = `${minutes} min read`;
  };
}
