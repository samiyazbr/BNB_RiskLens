import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl font-bold mb-6">
              See Risk Warnings
              <br />
              <span className="text-primary">Before</span> You Click Approve
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              BNB RiskLens automatically detects tokens on DEX pages and shows risk badges BEFORE you interact. 
              No black-box AI. Just clear, verifiable rules that expose scams and honeypots.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/install">
                <button className="btn-primary text-lg px-8 py-4">
                  🔶 Install Extension
                </button>
              </Link>
              <Link href="/features">
                <button className="btn-secondary text-lg px-8 py-4">
                  Learn More →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Why BNB RiskLens?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="⚡"
              title="Proactive Detection"
              description="Automatically scans DEX pages for token addresses the moment they appear. No manual action needed!"
            />
            <FeatureCard
              icon="🏷️"
              title="Instant Risk Badges"
              description="Shows color-coded badges (✅ LOW / ⚠️ MEDIUM / 🚨 HIGH) directly on the page BEFORE you click approve."
            />
            <FeatureCard
              icon="�"
              title="6 Deterministic Rules"
              description="Transparent risk evaluation using clear, verifiable rules. No hidden algorithms or black-box scoring."
            />
            <FeatureCard
              icon="📊"
              title="Detailed Risk Reports"
              description="Click any badge to see full analysis with specific issues, holder data, and liquidity checks."
            />
            <FeatureCard
              icon="🛡️"
              title="Non-Intrusive Protection"
              description="Inline badges don't block your workflow. You stay informed without disruption."
            />
            <FeatureCard
              icon="🔓"
              title="100% Open Source"
              description="All code is public, auditable, and transparent. No proprietary risk models or hidden behavior."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <Step
              number="1"
              title="Install Extension"
              description="Install BNB RiskLens Chrome extension - it works automatically once installed."
            />
            <Step
              number="2"
              title="Visit Any DEX"
              description="Go to PancakeSwap, Uniswap, or any DeFi platform as you normally would."
            />
            <Step
              number="3"
              title="See Risk Badges Automatically"
              description="When tokens appear on the page, risk badges (✅/⚠️/🚨) appear instantly - BEFORE you click anything."
            />
            <Step
              number="4"
              title="Click Badge for Details"
              description="Click any badge to see full risk report with specific issues, liquidity data, and holder info."
            />
            <Step
              number="5"
              title="Make Informed Decisions"
              description="Proceed confidently with safe tokens, or avoid risky ones - you're protected before any interaction!"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for proactive protection?</h2>
          <p className="text-xl text-gray-400 mb-10">
            See risk warnings the moment tokens appear - BEFORE you click approve. Zero effort, maximum protection.
          </p>
          <Link href="/install">
            <button className="btn-primary text-lg px-10 py-4">
              🛡️ Install BNB RiskLens Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-primary text-dark font-bold rounded-full flex items-center justify-center text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}
