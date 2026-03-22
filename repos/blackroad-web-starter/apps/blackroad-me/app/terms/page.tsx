import { siteConfig } from "../site-config";

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Terms of Use</h1>
      <p>
        By accessing {siteConfig.name}, you agree to engage with integrity, protect shared information, and comply with
        applicable regulations. Services are provided on a best-effort basis while we continuously enhance safeguards.
      </p>
      <p>
        Unless a separate agreement is executed, all materials are provided "as is" without warranties. We limit
        liability to the maximum extent permitted by law.
      </p>
      <p>
        Questions about these terms may be directed through our contact form.
      </p>
    </article>
  );
}
