import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export type IdeaStatus = 'draft' | 'active' | 'parked';

export type Idea = {
  slug: string;
  title: string;
  tags: string[];
  status: IdeaStatus;
  eta: string;
  content: string;
};

const ideasDir = path.resolve('ideas');

async function parseIdea(fileName: string): Promise<Idea> {
  const fullPath = path.join(ideasDir, fileName);
  const fileContents = await fs.readFile(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: fileName.replace(/\.md$/, ''),
    title: data.title ?? fileName,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: (data.status as IdeaStatus) ?? 'draft',
    eta: data.eta ?? 'TBD',
    content: content.trim(),
  };
}

export async function getIdeas(): Promise<Idea[]> {
  const files = (await fs.readdir(ideasDir)).filter((file) => file.endsWith('.md'));
  const ideas = await Promise.all(files.map(parseIdea));
  return ideas.sort((a, b) => b.slug.localeCompare(a.slug));
}

export async function getIdeaBySlug(slug: string): Promise<Idea | undefined> {
  const fullSlug = slug.endsWith('.md') ? slug : `${slug}.md`;
  const files = await fs.readdir(ideasDir);
  if (!files.includes(fullSlug)) return undefined;
  return parseIdea(fullSlug);
}
