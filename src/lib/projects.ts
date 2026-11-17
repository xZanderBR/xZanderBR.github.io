import { getCollection, type CollectionEntry } from 'astro:content';

export function sortProjects<T extends { data: { order: number } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

export async function getSortedProjects(): Promise<CollectionEntry<'projects'>[]> {
  return sortProjects(await getCollection('projects'));
}
