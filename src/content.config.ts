import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    // Optional manual estimate, useful for diagram-heavy explanations.
    readingMinutes: z.number().int().positive().optional(),
    // Local image paths are relative to the Markdown file, as in Astro's image guide.
    cover: z.object({
      image: image(),
      alt: z.string().min(1),
    }).optional(),
  }),
});

export const collections = { blog };
