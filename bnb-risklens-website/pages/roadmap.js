import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 text-center">Roadmap</h1>
          <p className="text-xl text-gray-400 mb-16 text-center">
            Our vision for the future of transparent token risk evaluation
          </p>

          <div className="space-y-8">
            {/* Phase 1 */}
            <RoadmapPhase
              phase="Phase 1"
              title="Foundation"
              status="completed"
              items={[
                "✅ Build Chrome extension with 6 deterministic rules",
                "✅ Implement proactive token detection",
                "✅ Create inline risk badge system (✅/⚠️/🚨)",
                "✅ Show warnings BEFORE users click approve",
                "✅ Deploy RiskFeed smart contract on BNB Testnet",
                "✅ Create demo tokens (Safe, Medium Risk, Honeypot)",
                "✅ Launch documentation website",
                "✅ Open source all code on GitHub"
              ]}
            />

            {/* Phase 2 */}
            <RoadmapPhase
              phase="Phase 2"
              title="Community & Distribution"
              status="in-progress"
              items={[
                "🔄 Submit extension to Chrome Web Store",
                "🔄 Deploy contracts to BNB Mainnet",
                "🔄 Build community on Twitter, Telegram, Discord",
                "🔄 Create video tutorials and demos",
                "⏳ Partner with BNB Chain projects",
                "⏳ Integrate with popular DeFi platforms"
              ]}
            />

            {/* Phase 3 */}
            <RoadmapPhase
              phase="Phase 3"
              title="Enhanced Features"
              status="planned"
              items={[
                "📋 Add 5+ new risk detection rules",
                "📋 Multi-token batch evaluation",
                "📋 Historical price chart integration",
                "📋 Token holder distribution visualization",
                "📋 Export risk reports as PDF",
                "📋 Browser notifications for risky transactions"
              ]}
            />

            {/* Phase 4 */}
            <RoadmapPhase
              phase="Phase 4"
              title="Cross-Chain Expansion"
              status="planned"
              items={[
                "📋 Ethereum mainnet support",
                "📋 Polygon network support",
                "📋 Arbitrum and Optimism support",
                "📋 Cross-chain risk aggregation",
                "📋 Unified risk database",
                "📋 Mobile app (iOS & Android)"
              ]}
            />

            {/* Phase 5 */}
            <RoadmapPhase
              phase="Phase 5"
              title="Advanced Intelligence"
              status="planned"
              items={[
                "📋 Machine learning for pattern recognition (transparent models)",
                "📋 Social sentiment analysis integration",
                "📋 Automated contract audit summaries",
                "📋 Risk prediction based on historical data",
                "📋 Developer reputation scoring",
                "📋 API for third-party integrations"
              ]}
            />

            {/* Community Suggestions */}
            <div className="card border-primary/30">
              <h3 className="text-2xl font-bold mb-4">💡 Have a Suggestion?</h3>
              <p className="text-gray-400 mb-4">
                We're building BNB RiskLens for the community. Your feedback shapes our roadmap.
              </p>
              <a
                href="https://github.com/samiyazbr/BNB_RiskLens/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn-primary">
                  Submit Feature Request
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function RoadmapPhase({ phase, title, status, items }) {
  const statusConfig = {
    completed: { bg: 'bg-success/10', border: 'border-success', badge: 'bg-success', text: 'Completed' },
    'in-progress': { bg: 'bg-warning/10', border: 'border-warning', badge: 'bg-warning', text: 'In Progress' },
    planned: { bg: 'bg-gray-800/30', border: 'border-gray-700', badge: 'bg-gray-700', text: 'Planned' }
  };

  const config = statusConfig[status];

  return (
    <div className={`card ${config.border} ${config.bg} border-l-4`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm text-gray-400">{phase}</span>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <span className={`${config.badge} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {config.text}
        </span>
      </div>
      <ul className="space-y-2 text-gray-300">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
