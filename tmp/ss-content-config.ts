import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.date(),
    author:      z.string().default('The Second Spring'),
    tags:        z.array(z.string()).default([]),
    readTime:    z.string().default('5 min read'),
    featured:    z.boolean().default(false),
  }),
});

export const collections = { blog };
