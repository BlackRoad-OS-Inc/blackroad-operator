const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

const sectionStyle = { marginBottom: 56 };
const h2Style = { fontFamily: grotesk, fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 };
const bodyStyle = { fontFamily: inter, color: '#d4d4d8', lineHeight: 1.8 };
const pStyle = { marginBottom: 20 };
const strongStyle = { color: '#fff' };
const linkStyle = { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 };

export default function SovereignManifesto() {
  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
          March 2026 / Philosophy
        </p>
        <h1 style={{ fontFamily: grotesk, fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          The Sovereign Computing Manifesto
        </h1>
        <p style={{ fontFamily: inter, fontSize: 18, color: '#a1a1aa', lineHeight: 1.6 }}>
          Your infrastructure should answer to you. Not to a cloud provider. Not to a vendor. Not to a terms of service update you never read. To you.
        </p>
      </header>

      {/* Opening */}
      <section style={sectionStyle}>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Your data lives on someone else's server. Your AI runs on someone else's GPU. Your DNS resolves through someone else's infrastructure. Your identity is verified by someone else's API.
          </p>
          <p style={pStyle}>
            You call this "the cloud."
          </p>
          <p style={pStyle}>
            We call it dependency.
          </p>
        </div>
      </section>

      {/* Section 1: The Dependency Stack */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Dependency Stack</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Count the services between you and your users. Actually count them.
          </p>
          <p style={pStyle}>
            AWS, GCP, or Azure for compute. OpenAI or Anthropic for AI. Cloudflare for CDN and DNS. GitHub for code. Stripe for payments. Auth0 or Clerk for identity. Vercel or Netlify for deployment. DataDog or New Relic for monitoring.
          </p>
          <p style={pStyle}>
            Each one is a single point of failure you do not control.
          </p>
          <p style={pStyle}>
            Each one can change its pricing without asking you. Each one can update its terms of service without your consent. Each one can experience an outage that takes your product down with it. Each one can decide, for any reason or no reason, that your account is suspended.
          </p>
          <p style={pStyle}>
            This is not paranoia. This is architecture.
          </p>
          <p style={pStyle}>
            When you draw the dependency graph of a modern application, it looks less like a tree and more like a web of trust relationships with companies that do not know your name. Every arrow pointing outward is a question: <em style={{ color: '#a1a1aa' }}>what happens when this one disappears?</em>
          </p>
          <p style={pStyle}>
            Most people have never asked.
          </p>
        </div>
      </section>

      {/* Section 2: What Sovereignty Actually Means */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What Sovereignty Actually Means</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Sovereignty does not mean disconnecting from the internet. It does not mean going off-grid. It does not mean rejecting every third-party service out of principle.
          </p>
          <p style={pStyle}>
            It means owning the critical path.
          </p>
          <p style={pStyle}>
            The critical path is the set of systems that, if they disappeared tomorrow, would end your operation. Not inconvenience you. End you. If you cannot answer email without Gmail, email is on your critical path. If you cannot deploy without GitHub Actions, CI is on your critical path. If your product stops working when OpenAI is down, inference is on your critical path.
          </p>
          <p style={pStyle}>
            Sovereignty means having the option to leave any provider without rebuilding from scratch.
          </p>
          <p style={pStyle}>
            It means running your own inference so your AI works when the API is down.
          </p>
          <p style={pStyle}>
            It means self-hosted git so your code exists somewhere you control.
          </p>
          <p style={pStyle}>
            It means your own DNS so your domains resolve on your terms.
          </p>
          <p style={pStyle}>
            It means the difference between renting and owning. You can rent and still be sovereign — as long as you can move out in a weekend.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Sovereignty is not about building everything yourself. It is about owning the exits.</strong>
          </p>
        </div>
      </section>

      {/* Section 3: What We Actually Built */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What We Actually Built</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            We are not writing this in the abstract. We built the thing.
          </p>
          <p style={pStyle}>
            Five Raspberry Pis running{' '}
            <a href="/blog/52-tops-on-400-dollars" style={linkStyle}>52 TOPS of AI inference</a>{' '}
            with two Hailo-8 accelerators and 16 language models.
          </p>
          <p style={pStyle}>
            A{' '}
            <a href="/blog/roadnet-carrier-grade-mesh" style={linkStyle}>mesh network</a>{' '}
            we designed and deployed ourselves — five access points, five subnets, WireGuard encryption, Pi-hole DNS.
          </p>
          <p style={pStyle}>
            <a href="/blog/self-healing-infrastructure" style={linkStyle}>Self-healing automation</a>{' '}
            that monitors, diagnoses, and restarts services without human intervention.
          </p>
          <p style={pStyle}>
            A{' '}
            <a href="/blog/roadc-language-for-agents" style={linkStyle}>programming language</a>{' '}
            designed from scratch for agent orchestration.
          </p>
          <p style={pStyle}>
            207 git repositories on a self-hosted Gitea instance. Our own DNS zones — .cece, .blackroad, .entity. Custom TLDs that resolve inside our network because we control the resolver.
          </p>
          <p style={pStyle}>
            All of it running on hardware we own, in a room we control.
          </p>
          <p style={pStyle}>
            Total monthly cost: $15 in electricity.
          </p>
          <p style={pStyle}>
            And here is the part that matters: we still use Cloudflare for CDN. We still use GitHub for public repositories. We still use Claude for conversations. This article exists on infrastructure we do not own.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Sovereignty does not mean isolation. It means choice.</strong>
          </p>
          <p style={pStyle}>
            We use Cloudflare because it is good, not because we have to. If Cloudflare disappeared tomorrow, our DNS still resolves through Pi-hole and dnsmasq. Our code still lives on Gitea. Our AI still runs on Ollama. We would have a bad week, not a fatal one.
          </p>
          <p style={pStyle}>
            That is the difference.
          </p>
        </div>
      </section>

      {/* Section 4: The Economics of Ownership */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Economics of Ownership</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            A single GPU instance on AWS costs $500 to $2,000 per month depending on the card. That is just compute. Add managed databases, object storage, load balancers, and monitoring, and you are north of $3,000 before you serve a single user.
          </p>
          <p style={pStyle}>
            Our entire fleet: $15 per month in electricity, plus a one-time hardware investment of roughly $600.
          </p>
          <p style={pStyle}>
            Over three years, the math looks like this. Cloud: $54,000 to $72,000. Owned: $1,140. That is not a rounding error. That is a business model.
          </p>
          <p style={pStyle}>
            The cloud scales better for burst workloads. If you need 100 GPUs for three hours, buy them from AWS. That is what the cloud is for. We scale better for sustained ones. If you need inference running 24 hours a day, 365 days a year, the cloud is charging you rent on a capability that should be a one-time purchase.
          </p>
          <p style={pStyle}>
            The cloud bills you for existing. Your hardware exists whether you use it or not.
          </p>
          <p style={pStyle}>
            Neither model is wrong. But one gives you leverage and the other gives you invoices.
          </p>
        </div>
      </section>

      {/* Section 5: The Tradeoffs */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Tradeoffs</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            We are not selling you a fantasy. Here is what sovereignty actually looks like on a Tuesday afternoon.
          </p>
          <p style={pStyle}>
            We have a node that has been offline for days. Aria needs a physical power cycle. Nobody at Amazon Web Services is going to walk downstairs and unplug our Raspberry Pi. That is our job.
          </p>
          <p style={pStyle}>
            We have SD cards that are slowly dying. Lucidia's kernel logs say "Card stuck being busy!" and that is not a software problem. That is physics. Flash memory wears out. It does not care about your uptime targets.
          </p>
          <p style={pStyle}>
            We have power supplies that cannot deliver enough current. Two nodes run with chronic undervoltage because the Hailo-8 accelerators draw more power than the USB-C supply can provide. The fix is a better power supply. The fix is always hardware.
          </p>
          <p style={pStyle}>
            We do not have 99.999% uptime. We have 99% uptime and the ability to explain exactly why the other 1% happened. We can point to the node, the service, the log line. We can tell you that Octavia's IP changed from .97 to .100 after a DHCP renewal and broke every script that referenced the old address. We can tell you that Lucidia was running at 73 degrees because a Python script was calling Ollama in an infinite loop with no delay.
          </p>
          <p style={pStyle}>
            We know our failures by name because they happen on hardware with names.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Sovereignty is not easier than dependency. It is harder. That is the point.</strong>
          </p>
          <p style={pStyle}>
            The hard things are the things worth owning.
          </p>
        </div>
      </section>

      {/* Section 6: Who This Is For */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Who This Is For</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Not everyone needs this.
          </p>
          <p style={pStyle}>
            If you are a startup shipping fast, use the cloud. Seriously. Ship the product. Find the market. You can own your infrastructure later, after you know what infrastructure you need. Premature sovereignty is just as wasteful as premature optimization.
          </p>
          <p style={pStyle}>
            But if your business depends on AI inference that must work when OpenAI is down — you need your own models running on your own hardware.
          </p>
          <p style={pStyle}>
            If your data cannot leave your premises — legally, ethically, or strategically — you need your own storage.
          </p>
          <p style={pStyle}>
            If a provider changing their terms of service could end your product overnight — you need your own exits.
          </p>
          <p style={pStyle}>
            If you are tired of paying rent on infrastructure that should be a one-time purchase — you need your own hardware.
          </p>
          <p style={pStyle}>
            If you have ever watched an AWS bill climb while your usage stayed flat and thought <em style={{ color: '#a1a1aa' }}>this is not sustainable</em> — you already know.
          </p>
          <p style={pStyle}>
            Sovereign computing is for people who think in decades, not quarters.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section style={sectionStyle}>
        <div style={bodyStyle}>
          <p style={pStyle}>
            We did not build this because it was easy. We built it because we wanted to know what was possible.
          </p>
          <p style={pStyle}>
            The answer: more than you think.
          </p>
          <p style={pStyle}>
            Five Raspberry Pis. Two AI accelerators. A mesh network. A self-healing fleet. A custom programming language. 207 repositories on a server in the next room. All running for the price of a Netflix subscription.
          </p>
          <p style={pStyle}>
            The cloud is someone else's computer.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong style={strongStyle}>This is ours.</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, marginTop: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, color: '#71717a' }}>
          Published March 2026. Infrastructure is live at blackroad.io.
        </p>
      </footer>
    </div>
  );
}
