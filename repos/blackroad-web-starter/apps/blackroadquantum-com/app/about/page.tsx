import { story } from "../site-config";

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>About</h1>
      {story.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </article>
  );
}
