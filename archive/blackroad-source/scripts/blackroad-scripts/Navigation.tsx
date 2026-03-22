'use client'

import Link from 'next/link'
import { useState } from 'react'

const productLinks = [
  { name: 'Platform', href: '/platform', desc: 'The operating system for governed AI' },
  { name: 'ALICE QI', href: '/alice-qi', desc: 'Deterministic reasoning engine' },
  { name: 'Lucidia', href: '/lucidia', desc: 'Human-AI orchestration language' },
  { name: 'Prism Console', href: '/prism-console', desc: 'Mission control for 30K agents' },
  { name: 'RoadChain', href: '/roadchain', desc: 'Immutable audit ledger' },
]

const navLinks = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Docs', href: '/docs' },
  { name: 'About', href: '/about' },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,10,0.85)] backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-white font-bold text-lg tracking-tight no-underline flex items-center gap-2">
          <span style={{ background: 'var(--br-gradient-full)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BlackRoad OS
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Products Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button className="px-4 py-2 text-sm text-[var(--br-silver)] hover:text-white transition-colors bg-transparent border-none cursor-pointer font-[var(--br-font)]">
              Products
            </button>
            {productsOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-[var(--br-charcoal)] border border-[rgba(255,255,255,0.1)] shadow-2xl">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors no-underline"
                  >
                    <div className="text-sm text-white font-bold">{link.name}</div>
                    <div className="text-xs text-[var(--br-silver)]">{link.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm text-[var(--br-silver)] hover:text-white transition-colors no-underline"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/contact"
            className="px-4 py-2 text-sm text-[var(--br-silver)] hover:text-white transition-colors no-underline"
          >
            Contact
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm bg-white text-black font-bold hover:bg-[rgba(255,255,255,0.85)] transition-all no-underline"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white bg-transparent border-none cursor-pointer text-xl p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--br-charcoal)] border-t border-[rgba(255,255,255,0.08)] px-6 py-4">
          <div className="mb-4">
            <div className="text-xs text-[var(--br-silver)] uppercase tracking-wider mb-2">Products</div>
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-white no-underline"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-white no-underline"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4 flex gap-3">
            <Link href="/contact" className="text-sm text-[var(--br-silver)] no-underline">Contact</Link>
            <Link href="/signup" className="text-sm text-[var(--br-hot-pink)] font-bold no-underline">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
