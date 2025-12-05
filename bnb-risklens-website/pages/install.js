import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Install() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 text-center">
            Install BNB RiskLens
          </h1>
          <p className="text-xl text-gray-400 mb-6 text-center">
            Get proactive protection in minutes - see risk warnings BEFORE you click approve
          </p>
          
          {/* Feature Highlight */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-12 text-center">
            <p className="text-primary font-bold text-lg mb-2">⚡ Proactive Token Detection Enabled!</p>
            <p className="text-gray-300">
              Once installed, BNB RiskLens automatically scans DEX pages and shows risk badges BEFORE you click approve. Zero effort, maximum protection!
            </p>
          </div>

          {/* Chrome Web Store Button */}
          <div className="card text-center mb-12">
            <div className="text-6xl mb-4">🔶</div>
            <h2 className="text-2xl font-bold mb-4">Chrome Extension</h2>
            <p className="text-gray-400 mb-6">
              Install from Chrome Web Store (coming soon) or load manually
            </p>
            <button className="btn-primary text-lg px-8 py-4" disabled>
              📦 Install from Chrome Web Store
            </button>
            <p className="text-sm text-gray-500 mt-4">Coming soon to Chrome Web Store</p>
          </div>

          {/* Manual Installation */}
          <div className="card mb-12">
            <h2 className="text-2xl font-bold mb-4">🛠️ Manual Installation (For Development)</h2>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold">Clone the repository</p>
                  <code className="block mt-2 bg-dark p-3 rounded text-sm">
                    git clone https://github.com/samiyazbr/BNB_RiskLens.git
                  </code>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold">Navigate to extension directory</p>
                  <code className="block mt-2 bg-dark p-3 rounded text-sm">
                    cd BNB_RiskLens/bnb-risklens-extension
                  </code>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">3</span>
                <div>
                  <p className="font-semibold">Open Chrome Extensions page</p>
                  <p className="text-gray-400 mt-1">Navigate to <code className="bg-dark px-2 py-1 rounded">chrome://extensions</code></p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">4</span>
                <div>
                  <p className="font-semibold">Enable Developer Mode</p>
                  <p className="text-gray-400 mt-1">Toggle the switch in the top right corner</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">5</span>
                <div>
                  <p className="font-semibold">Load unpacked extension</p>
                  <p className="text-gray-400 mt-1">Click "Load unpacked" and select the extension directory</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-dark font-bold rounded-full flex items-center justify-center">6</span>
                <div>
                  <p className="font-semibold">Pin the extension</p>
                  <p className="text-gray-400 mt-1">Click the extension icon and pin BNB RiskLens for easy access</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Requirements */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">📋 Requirements</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Google Chrome or Chromium-based browser (Chrome, Brave, Edge)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> MetaMask wallet extension installed
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> BNB Chain network configured in MetaMask
              </li>
            </ul>
          </div>

          {/* How to Use */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">🚀 How to Use After Installation</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-primary mb-2">Proactive Protection (Works Automatically!)</h3>
                <p>Simply visit any DEX like PancakeSwap or Uniswap. BNB RiskLens will automatically:</p>
                <ol className="mt-2 ml-5 space-y-1">
                  <li>1. Detect token addresses when they appear on the page</li>
                  <li>2. Evaluate risk instantly in the background</li>
                  <li>3. Show color-coded badges: ✅ LOW / ⚠️ MEDIUM / 🚨 HIGH</li>
                  <li>4. Display warnings BEFORE you click approve</li>
                  <li>5. Click any badge to see detailed risk report</li>
                </ol>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
                <p className="font-semibold text-primary mb-1">💡 Pro Tip:</p>
                <p className="text-sm">You don't need to open the extension manually anymore. It works automatically in the background!</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">What's Next?</h3>
            <p className="text-gray-400 mb-6">
              Learn more about how automatic protection works and the 6 risk rules
            </p>
            <a href="/docs">
              <button className="btn-secondary">
                Read Documentation →
              </button>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
