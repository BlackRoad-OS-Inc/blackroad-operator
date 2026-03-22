import Link from 'next/link'

const footerSections = [
  {
    title: 'Products',
    links: [
      { name: 'Platform', href: '/platform' },
      { name: 'ALICE QI', href: '/alice-qi' },
      { name: 'Lucidia', href: '/lucidia' },
      { name: 'Prism Console', href: '/prism-console' },
      { name: 'RoadChain', href: '/roadchain' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api-docs' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Blog', href: '/blog' },
      { name: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press-kit' },
      { name: 'Contact', href: '/contact' },
      { name: 'Status', href: '/status-page' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/legal-pages' },
      { name: 'Terms', href: '/legal-pages' },
      { name: 'Security', href: '/security' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--br-deep-black)] border-t border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold mb-4" style={{ background: 'var(--br-gradient-full)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BlackRoad OS
            </div>
            <p className="text-xs text-[var(--br-silver)] leading-relaxed mb-4">
              The operating system for governed AI. Deploy 30,000 autonomous agents with
              cryptographic identity and complete audit trails.
            </p>
            <p className="text-xs text-[var(--br-pewter)]">
              BlackRoad OS, Inc.
              <br />
              Delaware C-Corporation
            </p>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--br-platinum)] mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--br-silver)] hover:text-white transition-colors no-underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--br-pewter)]">
            &copy; {new Date().getFullYear()} BlackRoad OS, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/BlackRoad-OS" className="text-xs text-[var(--br-silver)] hover:text-white transition-colors no-underline">GitHub</a>
            <a href="mailto:blackroad.systems@gmail.com" className="text-xs text-[var(--br-silver)] hover:text-white transition-colors no-underline">Email</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
