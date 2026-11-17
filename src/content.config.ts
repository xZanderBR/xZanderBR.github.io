import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from '@/lib/schema';

const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { projects };
