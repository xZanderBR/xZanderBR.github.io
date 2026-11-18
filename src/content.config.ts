import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchemaWith } from '@/lib/schema';

const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/projects' }),
  schema: ({ image }) => projectSchemaWith(image),
});

export const collections = { projects };
