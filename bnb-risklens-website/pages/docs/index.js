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
              Everything you need to know about BNB RiskLens
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <DocCard
                title="📖 Getting Started"
                description="Learn how to install and use BNB RiskLens"
                href="/install"
              />
              <DocCard
                title="🔍 Risk Rules"
                description="Detailed explanation of all 6 risk evaluation rules"
                href="/docs/rules"
              />
              <DocCard
                title="🛡️ SafeApprove Guide"
                description="How to use SafeApprove to protect your wallet"
                href="/docs/safeapprove"
              />
              <DocCard
                title="📊 Risk Feed Contract"
                description="Technical documentation for the RiskFeed smart contract"
                href="/docs/riskfeed"
              />
              <DocCard
                title="⚙️ API Reference"
                description="Integration guide for developers"
                href="/docs/api"
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
                    add BNB RiskLens to Chrome.
                  </p>
                </Section>

                <Section title="2. Connect MetaMask">
                  <p className="text-gray-400">
                    Click the extension icon and connect your MetaMask wallet to BNB Chain.
                  </p>
                </Section>

                <Section title="3. Evaluate a Token">
                  <ul className="text-gray-400 space-y-2 ml-5">
                    <li>• Paste the token contract address</li>
                    <li>• Select the action type (Approve/Swap/Transfer)</li>
                    <li>• Click "Evaluate Risk"</li>
                  </ul>
                </Section>

                <Section title="4. Review Results">
                  <p className="text-gray-400">
                    Check the risk score, triggered rules, and AI explanation before proceeding with your transaction.
                  </p>
                </Section>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 card">
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
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
                  answer="Our deterministic rules catch common scam patterns with high accuracy. However, always do your own research before investing in any token."
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
