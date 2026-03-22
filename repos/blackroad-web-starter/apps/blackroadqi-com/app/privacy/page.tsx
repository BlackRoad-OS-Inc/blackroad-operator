import { siteConfig } from "../site-config";

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Privacy Policy</h1>
      <p>
        {siteConfig.name} respects the confidentiality of every participant. We collect only the information necessary
        to operate the service, secure our infrastructure, and respond to your requests.
      </p>
      <p>
        We do not sell personal data. Telemetry and analytics remain internal, used solely to improve reliability and
        trust. When we work with partners, we execute data processing agreements that preserve your rights.
      </p>
      <p>
        For privacy inquiries contact our steward team at the address listed on the contact page.
      </p>
    </article>
  );
}
