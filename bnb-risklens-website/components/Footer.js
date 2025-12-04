import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🔶</span>
              <span className="text-xl font-bold">BNB RiskLens</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transparent token risk evaluation for BNB Chain.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/features" className="hover:text-primary">Features</Link></li>
              <li><Link href="/install" className="hover:text-primary">Install</Link></li>
              <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
              <li><Link href="/roadmap" className="hover:text-primary">Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/docs/rules" className="hover:text-primary">Risk Rules</Link></li>
              <li><Link href="/docs/api" className="hover:text-primary">API Reference</Link></li>
              <li><Link href="/docs/riskfeed" className="hover:text-primary">Risk Feed Contract</Link></li>
              <li><a href="https://github.com/samiyazbr/BNB_RiskLens" className="hover:text-primary">GitHub</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://twitter.com/bnbrisklens" className="hover:text-primary">Twitter</a></li>
              <li><a href="https://t.me/bnbrisklens" className="hover:text-primary">Telegram</a></li>
              <li><a href="https://discord.gg/bnbrisklens" className="hover:text-primary">Discord</a></li>
              <li><a href="https://github.com/samiyazbr/BNB_RiskLens/issues" className="hover:text-primary">Report Issues</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 BNB RiskLens. Open source under MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
