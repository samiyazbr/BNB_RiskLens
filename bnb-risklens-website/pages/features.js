import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6">
              Features
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to evaluate token risk and protect your wallet on BNB Chain
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* Rule Engine */}
            <FeatureSection
              title="🔍 6 Deterministic Rules"
              description="Our transparent rule engine evaluates tokens using clear, verifiable criteria:"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <RuleCard
                  id="R1"
                  name="Unlimited Approval"
                  severity="high"
                  description="Detects when a token requests unlimited spending permission from your wallet."
                />
                <RuleCard
                  id="R2"
                  name="Unverified Contract"
                  severity="high"
                  description="Flags tokens whose source code hasn't been verified on BSCScan."
                />
                <RuleCard
                  id="R3"
                  name="New Contract with Low Activity"
                  severity="medium"
                  description="Identifies recently deployed contracts with minimal transaction history."
                />
                <RuleCard
                  id="R4"
                  name="Very Few Holders"
                  severity="medium"
                  description="Warns about tokens with less than 50 unique holders."
                />
                <RuleCard
                  id="R5"
                  name="Low Liquidity"
                  severity="medium"
                  description="Alerts when DEX liquidity is below $10,000."
                />
                <RuleCard
                  id="R6"
                  name="Honeypot Bytecode Pattern"
                  severity="high"
                  description="Detects suspicious bytecode patterns common in honeypot scams."
                />
              </div>
            </FeatureSection>

            {/* SafeApprove */}
            <FeatureSection
              title="🛡️ SafeApprove Flow"
              description="Protect your wallet with our innovative temporary approval system:"
            >
              <div className="bg-light p-8 rounded-xl border border-gray-800">
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">1</span>
                    <div>
                      <h4 className="font-semibold">Set Temporary Allowance</h4>
                      <p className="text-gray-400">Approve only the exact amount needed for your transaction</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">2</span>
                    <div>
                      <h4 className="font-semibold">Execute Transaction</h4>
                      <p className="text-gray-400">Complete your swap, transfer, or other operation</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">3</span>
                    <div>
                      <h4 className="font-semibold">Automatic Reset to Zero</h4>
                      <p className="text-gray-400">Extension automatically revokes approval after transaction</p>
                    </div>
                  </li>
                </ol>
              </div>
            </FeatureSection>

            {/* Risk Feed */}
            <FeatureSection
              title="📊 On-Chain Risk Feed"
              description="Community-driven transparency through blockchain-based risk reporting:"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card">
                  <h4 className="font-semibold mb-2">📤 Publish Assessments</h4>
                  <p className="text-gray-400 text-sm">Share your risk evaluations on-chain for the community to see</p>
                </div>
                <div className="card">
                  <h4 className="font-semibold mb-2">🔍 Query History</h4>
                  <p className="text-gray-400 text-sm">View all historical risk reports for any token address</p>
                </div>
                <div className="card">
                  <h4 className="font-semibold mb-2">🔔 Real-Time Events</h4>
                  <p className="text-gray-400 text-sm">Subscribe to risk events and get instant notifications</p>
                </div>
              </div>
            </FeatureSection>

            {/* Technical Features */}
            <FeatureSection
              title="⚙️ Technical Capabilities"
              description="Built with cutting-edge Web3 technology:"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TechFeature icon="⚡" title="Real-Time Data" description="Instant on-chain data fetching" />
                <TechFeature icon="💾" title="Smart Caching" description="Optimized performance with local storage" />
                <TechFeature icon="🔗" title="MetaMask Integration" description="Seamless wallet connection" />
                <TechFeature icon="📡" title="Multi-Network" description="BNB Mainnet & Testnet support" />
              </div>
            </FeatureSection>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FeatureSection({ title, description, children }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-3">{title}</h2>
      <p className="text-gray-400 mb-8">{description}</p>
      {children}
    </div>
  );
}

function RuleCard({ id, name, severity, description }) {
  const severityColors = {
    high: 'border-danger bg-danger/5',
    medium: 'border-warning bg-warning/5',
    low: 'border-success bg-success/5'
  };

  return (
    <div className={`card border-l-4 ${severityColors[severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{name}</h4>
        <span className="text-xs px-2 py-1 bg-gray-800 rounded">{id}</span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function TechFeature({ icon, title, description }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
