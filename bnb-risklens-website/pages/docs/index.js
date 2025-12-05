import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Docs() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Documentation</h1>
            <p className="text-xl text-gray-400 mb-12">
              Everything you need to know about BNB RiskLens proactive protection
            </p>

            {/* New Feature Banner */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8">
              <h3 className="text-2xl font-bold text-primary mb-3">⚡ Proactive Token Detection</h3>
              <p className="text-gray-300 mb-3">
                BNB RiskLens automatically scans DEX pages and shows risk badges the moment tokens appear - BEFORE you click approve!
              </p>
              <ul className="text-gray-300 space-y-2 ml-5">
                <li>✅ Zero effort - scans automatically on all DEXs</li>
                <li>✅ Inline risk badges (✅/⚠️/🚨) appear instantly</li>
                <li>✅ See warnings BEFORE you click anything</li>
                <li>✅ Click badge for detailed risk report</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <DocCard
                title="⚡ Proactive Protection"
                description="How automatic token detection works"
                href="/docs/proactive-protection"
              />
              <DocCard
                title="� Getting Started"
                description="Learn how to install and use BNB RiskLens"
                href="/install"
              />
              <DocCard
                title="🔍 Risk Rules"
                description="Detailed explanation of all 6 risk evaluation rules"
                href="/docs/rules"
              />
              <DocCard
                title="� Unlimited Approvals"
                description="Understanding and avoiding unlimited approval risks"
                href="/docs/unlimited-approvals"
              />
              <DocCard
                title="📊 Risk Feed Contract"
                description="Technical documentation for the RiskFeed smart contract"
                href="/docs/riskfeed"
              />
              <DocCard
                title="💻 GitHub"
                description="View source code and contribute"
                href="https://github.com/samiyazbr/BNB_RiskLens"
                external
              />
            </div>

            {/* Quick Start */}
            <div className="mt-16 card">
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              
              <div className="space-y-6">
                <Section title="1. Install the Extension">
                  <p className="text-gray-400">
                    Follow our <Link href="/install" className="text-primary hover:underline">installation guide</Link> to
                    add BNB RiskLens to Chrome. Enable the extension and reload any open DEX tabs.
                  </p>
                </Section>

                <Section title="2. Visit Any DEX">
                  <p className="text-gray-400">
                    Go to PancakeSwap, Uniswap, or any decentralized exchange. The extension works automatically on all websites.
                  </p>
                </Section>

                <Section title="3. See Risk Badges Automatically">
                  <p className="text-gray-400 mb-2">
                    When tokens appear on the page, BNB RiskLens automatically:
                  </p>
                  <ul className="text-gray-400 space-y-2 ml-5">
                    <li>• Detects token addresses on the page</li>
                    <li>• Evaluates risk using 6 deterministic rules</li>
                    <li>• Shows inline badges: ✅ LOW / ⚠️ MEDIUM / 🚨 HIGH</li>
                    <li>• Displays warnings BEFORE you click approve</li>
                    <li>• Updates instantly as new tokens appear</li>
                  </ul>
                </Section>

                <Section title="4. Click Badges for Details">
                  <p className="text-gray-400">
                    Click any risk badge to see a detailed report with specific issues, liquidity data, and holder information. Make informed decisions before any interaction!
                  </p>
                </Section>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 card">
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <FAQ
                  question="How does proactive detection work?"
                  answer="BNB RiskLens uses a MutationObserver to scan web pages for token addresses as they appear. When a token address is detected, it automatically evaluates the token using our 6 deterministic rules and shows an inline risk badge (✅/⚠️/🚨) BEFORE you interact with any approve button."
                />
                <FAQ
                  question="Do I need to manually check tokens anymore?"
                  answer="No! That's the beauty of proactive detection. You don't need to open the extension or paste addresses. Risk badges appear automatically when tokens load on DEX pages - you see warnings BEFORE you even think about clicking approve."
                />
                <FAQ
                  question="What do the risk badge colors mean?"
                  answer="✅ GREEN (LOW RISK) = Safe to use. ⚠️ YELLOW (MEDIUM RISK) = Proceed with caution, some concerns detected. 🚨 RED (HIGH RISK) = Strong warning, multiple issues found. Click any badge to see detailed reasons."
                />
                <FAQ
                  question="Can I see more details about a token?"
                  answer="Yes! Click any risk badge to open a detailed modal showing the token address, risk level, and specific issues detected (like low liquidity, unverified contract, high holder concentration, etc.)."
                />
                <FAQ
                  question="Is BNB RiskLens free to use?"
                  answer="Yes! BNB RiskLens is completely free and open source. There are no fees for using the extension or querying risk data."
                />
                <FAQ
                  question="Does it work on mobile?"
                  answer="Currently, BNB RiskLens is available as a Chrome extension for desktop browsers. Mobile app support is on our roadmap."
                />
                <FAQ
                  question="How accurate are the risk assessments?"
                  answer="Our 6 deterministic rules catch common scam patterns including unverified contracts, honeypots, low liquidity, and unlimited approvals. We use transparent, verifiable criteria - no black-box AI. Always do your own research before investing."
                />
                <FAQ
                  question="What's an 'unlimited approval' and why is it dangerous?"
                  answer="An unlimited approval gives a smart contract permission to spend ALL of your tokens, not just the amount needed for one transaction. If that contract is malicious or gets hacked, it can drain your entire wallet. BNB RiskLens warns you about these before you approve."
                />
                <FAQ
                  question="Can I contribute to the project?"
                  answer="Absolutely! BNB RiskLens is open source. Check out our GitHub repository to contribute code, report issues, or suggest features."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DocCard({ title, description, href, external = false }) {
  return (
    <Link href={href} target={external ? '_blank' : undefined}>
      <div className="card hover:border-primary transition-all cursor-pointer h-full">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </Link>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FAQ({ question, answer }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-gray-400 text-sm">{answer}</p>
    </div>
  );
}
