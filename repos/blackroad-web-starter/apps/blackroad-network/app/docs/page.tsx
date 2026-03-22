import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { siteConfig } from "../site-config";

interface DocSection {
  title: string;
  body: string;
}

const repoUrl = "https://github.com/blackroadlabs/blackroad-prism-console";

function parseDoc(raw: string): DocSection[] {
  const lines = raw
    .split("\n")
    .filter((line) => !line.trim().startsWith("---"))
    .filter((line) => line.trim().length > 0);

  const sections: DocSection[] = [];
  let current: DocSection | null = null;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (current) {
        sections.push(current);
      }
      current = { title: line.replace(/^#\s*/, ""), body: "" };
    } else if (current) {
      current.body = `${current.body}${line}\n`;
    }
  }

  if (current) {
    sections.push(current);
  }

  return sections;
}

const loadDoc = cache(async () => {
  const docPath = path.resolve(process.cwd(), "content", "docs", "index.mdx");
  try {
    const raw = await fs.readFile(docPath, "utf8");
    return parseDoc(raw);
  } catch (error) {
    return [];
  }
});

export default async function DocsPage() {
  const sections = await loadDoc();
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Documentation</h1>
      <p>
        Welcome to the {siteConfig.name} documentation portal. Review our architecture notes, operating models, and
        integration guidance inside the GitHub repository.
      </p>
      <ul>
        <li>
          <Link href={repoUrl} className="text-indigo-600 hover:text-indigo-500">
            Browse the README
          </Link>
        </li>
        <li>
          <Link href="/status" className="text-indigo-600 hover:text-indigo-500">
            Check live service status
          </Link>
        </li>
      </ul>

      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.body
            .trim()
            .split("\n")
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </section>
      ))}
    </article>
  );
}
