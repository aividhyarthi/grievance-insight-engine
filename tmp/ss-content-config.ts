import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.date(),
    author:      z.string().default('Journal Desk'),
    tags:        z.array(z.string()).default([]),
    readTime:    z.string().default('5 min read'),
    featured:    z.boolean().default(false),
    image:       z.string().optional(),
    imageAlt:    z.string().optional(),
  }),
});

const community = defineCollection({
  type: 'content',
  schema: z.object({
    question:     z.string(),
    askerName:    z.string(),
    askerAge:     z.number(),
    askerCity:    z.string(),
    category:     z.string(),
    answeredBy:   z.string(),
    replies:      z.array(z.object({
      name: z.string(),
      text: z.string(),
    })).default([]),
    relatedJournals: z.array(z.object({
      title: z.string(),
      href:  z.string(),
    })).default([]),
    tags:    z.array(z.string()).default([]),
    date:    z.date(),
  }),
});

export const collections = { blog, community };
