import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const content = defineCollection({
  loader: glob({
    base: './src/content/materials',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['psychoanalysis', 'philosophy']),
    publishedAt: z.string().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { content };
