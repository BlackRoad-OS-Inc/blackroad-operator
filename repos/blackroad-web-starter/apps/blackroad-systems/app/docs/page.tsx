import Link from "next/link";
import { siteConfig } from "../site-config";

const repoUrl = "https://github.com/blackroadlabs/blackroad-prism-console";

export default function DocsPage() {
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
    </article>
  );
}
