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
              <span className="text-primary">Transparent</span> Token Risk
              <br />
              Evaluation for BNB Chain
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              Protect your wallet with deterministic risk assessment. No black-box AI. 
              Just clear, verifiable rules that expose scams and honeypots.
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
              icon="🔍"
              title="6 Deterministic Rules"
              description="Transparent risk evaluation using clear, verifiable rules. No hidden algorithms or black-box scoring."
            />
            <FeatureCard
              icon="🛡️"
              title="SafeApprove Flow"
              description="Temporarily approve exact amounts, execute transactions, then automatically reset to zero. Protect against wallet drainers."
            />
            <FeatureCard
              icon="📊"
              title="On-Chain Risk Feed"
              description="Publish and query risk assessments on-chain. Community-driven transparency for all BNB tokens."
            />
            <FeatureCard
              icon="⚡"
              title="Real-Time Analysis"
              description="Instant on-chain data fetching with liquidity checks, holder counts, and contract verification."
            />
            <FeatureCard
              icon="🎯"
              title="Clear Risk Levels"
              description="Simple LOW/MEDIUM/HIGH scoring with detailed explanations for every triggered rule."
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
              title="Connect MetaMask"
              description="Install the extension and connect your BNB Chain wallet."
            />
            <Step
              number="2"
              title="Enter Token Address"
              description="Paste the contract address of any token you want to evaluate."
            />
            <Step
              number="3"
              title="Review Risk Assessment"
              description="See which rules triggered, risk score, and detailed explanations."
            />
            <Step
              number="4"
              title="Use SafeApprove (Optional)"
              description="For risky tokens, use SafeApprove to protect your wallet with temporary allowances."
            />
            <Step
              number="5"
              title="Publish to Risk Feed"
              description="Share your assessment on-chain to help the community stay safe."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to protect your wallet?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of users evaluating token risk with transparency.
          </p>
          <Link href="/install">
            <button className="btn-primary text-lg px-10 py-4">
              Install BNB RiskLens Now
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
