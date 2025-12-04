const { ethers } = require("ethers");
const RiskFeedABI = require("../bnb-risklens-extension/riskFeed/RiskFeed.json");

/**
 * Example subscriber script for RiskFeed contract
 * Demonstrates how to listen to risk events published on-chain
 */

// Configuration
const CONFIG = {
  // Update this with your deployed RiskFeed address
  RISK_FEED_ADDRESS: process.env.RISK_FEED_ADDRESS || "0x0000000000000000000000000000000000000000",
  
  // BNB Testnet RPC
  RPC_URL: process.env.BNB_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/",
  
  // Network info
  CHAIN_ID: 97,
  NETWORK_NAME: "BNB Testnet"
};

/**
 * Initialize provider and contract
 */
function initializeContract() {
  console.log("🔗 Connecting to", CONFIG.NETWORK_NAME);
  console.log("📍 RPC URL:", CONFIG.RPC_URL);
  console.log("📄 RiskFeed Address:", CONFIG.RISK_FEED_ADDRESS);
  console.log("");
  
  // Create provider
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  
  // Create contract instance
  const riskFeed = new ethers.Contract(
    CONFIG.RISK_FEED_ADDRESS,
    RiskFeedABI,
    provider
  );
  
  return { provider, riskFeed };
}

/**
 * Subscribe to RiskPublished events
 */
async function subscribeToRiskEvents() {
  const { provider, riskFeed } = initializeContract();
  
  console.log("👂 Listening for RiskPublished events...\n");
  console.log("═".repeat(80));
  
  // Listen to RiskPublished events
  riskFeed.on("RiskPublished", (token, score, level, timestamp, reporter, rulesTriggered, event) => {
    const riskLevelNames = ["LOW", "MEDIUM", "HIGH"];
    const levelName = riskLevelNames[level] || "UNKNOWN";
    
    console.log("\n🚨 New Risk Report Published!");
    console.log("─".repeat(80));
    console.log("Token Address:    ", token);
    console.log("Risk Score:       ", score.toString(), "/10");
    console.log("Risk Level:       ", levelName);
    console.log("Rules Triggered:  ", rulesTriggered);
    console.log("Reporter:         ", reporter);
    console.log("Timestamp:        ", new Date(Number(timestamp) * 1000).toLocaleString());
    console.log("Block Number:     ", event.log.blockNumber);
    console.log("Transaction Hash: ", event.log.transactionHash);
    console.log("─".repeat(80));
  });
  
  // Listen to RiskUpdated events
  riskFeed.on("RiskUpdated", (token, oldScore, newScore, newLevel, reporter, event) => {
    const riskLevelNames = ["LOW", "MEDIUM", "HIGH"];
    const levelName = riskLevelNames[newLevel] || "UNKNOWN";
    
    console.log("\n🔄 Risk Report Updated!");
    console.log("─".repeat(80));
    console.log("Token Address:    ", token);
    console.log("Old Score:        ", oldScore.toString(), "/10");
    console.log("New Score:        ", newScore.toString(), "/10");
    console.log("New Risk Level:   ", levelName);
    console.log("Reporter:         ", reporter);
    console.log("Block Number:     ", event.log.blockNumber);
    console.log("Transaction Hash: ", event.log.transactionHash);
    console.log("─".repeat(80));
  });
  
  // Handle errors
  provider.on("error", (error) => {
    console.error("❌ Provider error:", error);
  });
  
  // Keep the script running
  console.log("✅ Subscriber is active. Press Ctrl+C to exit.\n");
}

/**
 * Query historical risk reports
 */
async function queryHistoricalReports() {
  const { provider, riskFeed } = initializeContract();
  
  console.log("📊 Querying historical risk reports...\n");
  
  try {
    // Get total number of reported tokens
    const reportedCount = await riskFeed.getReportedTokenCount();
    console.log("Total tokens reported:", reportedCount.toString(), "\n");
    
    if (reportedCount > 0) {
      console.log("═".repeat(80));
      
      // Fetch reports for all tokens
      for (let i = 0; i < reportedCount; i++) {
        const tokenAddress = await riskFeed.getReportedToken(i);
        const report = await riskFeed.getRiskReport(tokenAddress);
        
        const riskLevelNames = ["LOW", "MEDIUM", "HIGH"];
        const levelName = riskLevelNames[report.level] || "UNKNOWN";
        
        console.log(`\nToken #${i + 1}: ${tokenAddress}`);
        console.log("─".repeat(80));
        console.log("Risk Score:       ", report.score.toString(), "/10");
        console.log("Risk Level:       ", levelName);
        console.log("Rules Triggered:  ", report.rulesTriggered);
        console.log("Reporter:         ", report.reporter);
        console.log("Timestamp:        ", new Date(Number(report.timestamp) * 1000).toLocaleString());
      }
      
      console.log("\n" + "═".repeat(80));
    }
  } catch (error) {
    console.error("❌ Error querying reports:", error.message);
  }
}

/**
 * Query a specific token's risk report
 */
async function queryTokenRisk(tokenAddress) {
  const { provider, riskFeed } = initializeContract();
  
  console.log(`📊 Querying risk report for token: ${tokenAddress}\n`);
  
  try {
    const isReported = await riskFeed.isTokenReported(tokenAddress);
    
    if (!isReported) {
      console.log("⚠️  This token has not been reported yet.");
      return;
    }
    
    const report = await riskFeed.getRiskReport(tokenAddress);
    const riskLevelNames = ["LOW", "MEDIUM", "HIGH"];
    const levelName = riskLevelNames[report.level] || "UNKNOWN";
    
    console.log("═".repeat(80));
    console.log("Token Address:    ", report.token);
    console.log("Risk Score:       ", report.score.toString(), "/10");
    console.log("Risk Level:       ", levelName);
    console.log("Rules Triggered:  ", report.rulesTriggered);
    console.log("Reporter:         ", report.reporter);
    console.log("Timestamp:        ", new Date(Number(report.timestamp) * 1000).toLocaleString());
    console.log("═".repeat(80));
  } catch (error) {
    console.error("❌ Error querying token:", error.message);
  }
}

/**
 * Main function - parse command line arguments
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "subscribe";
  
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║           BNB RiskLens - Risk Feed Subscriber                 ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("");
  
  switch (command) {
    case "subscribe":
      await subscribeToRiskEvents();
      break;
    
    case "history":
      await queryHistoricalReports();
      break;
    
    case "query":
      if (args[1]) {
        await queryTokenRisk(args[1]);
      } else {
        console.log("❌ Please provide a token address:");
        console.log("   node subscriber_example.js query 0xTokenAddress");
      }
      break;
    
    default:
      console.log("Usage:");
      console.log("  node subscriber_example.js subscribe    - Listen to real-time events");
      console.log("  node subscriber_example.js history      - Query all historical reports");
      console.log("  node subscriber_example.js query 0x...  - Query specific token report");
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
