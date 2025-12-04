import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-secondary/95 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-3xl">🔶</span>
              <span className="text-xl font-bold">BNB RiskLens</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="hover:text-primary transition">
              Features
            </Link>
            <Link href="/docs" className="hover:text-primary transition">
              Documentation
            </Link>
            <Link href="/roadmap" className="hover:text-primary transition">
              Roadmap
            </Link>
            <Link href="https://github.com/samiyazbr/BNB_RiskLens" className="hover:text-primary transition">
              GitHub
            </Link>
            <Link href="/install">
              <button className="btn-primary">Install</button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <Link href="/features" className="hover:text-primary transition">
                Features
              </Link>
              <Link href="/docs" className="hover:text-primary transition">
                Documentation
              </Link>
              <Link href="/roadmap" className="hover:text-primary transition">
                Roadmap
              </Link>
              <Link href="https://github.com/samiyazbr/BNB_RiskLens" className="hover:text-primary transition">
                GitHub
              </Link>
              <Link href="/install">
                <button className="btn-primary w-full">Install</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
