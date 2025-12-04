const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for BNB RiskLens contracts
 * Deploys all demo tokens and the RiskFeed contract
 */
async function main() {
  console.log("🚀 Starting BNB RiskLens deployment...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log("📍 Network:", network);
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB\n");
  
  // Deployment configuration
  const deploymentConfig = {
    safeToken: {
      name: "SafeCoin",
      symbol: "SAFE",
      initialSupply: 1000000 // 1 million tokens
    },
    mediumRiskToken: {
      name: "MediumRiskCoin",
      symbol: "MRISK",
      initialSupply: 500000 // 500k tokens
    },
    honeypotToken: {
      name: "HoneyTrap",
      symbol: "TRAP",
      initialSupply: 10000000 // 10 million tokens
    }
  };
  
  const deployedContracts = {};
  
  // Deploy SafeToken
  console.log("📝 Deploying SafeToken...");
  const SafeToken = await hre.ethers.getContractFactory("SafeToken");
  const safeToken = await SafeToken.deploy(
    deploymentConfig.safeToken.name,
    deploymentConfig.safeToken.symbol,
    deploymentConfig.safeToken.initialSupply
  );
  await safeToken.waitForDeployment();
  deployedContracts.SafeToken = await safeToken.getAddress();
  console.log("✅ SafeToken deployed to:", deployedContracts.SafeToken, "\n");
  
  // Deploy MediumRiskToken
  console.log("📝 Deploying MediumRiskToken...");
  const MediumRiskToken = await hre.ethers.getContractFactory("MediumRiskToken");
  const mediumRiskToken = await MediumRiskToken.deploy(
    deploymentConfig.mediumRiskToken.name,
    deploymentConfig.mediumRiskToken.symbol,
    deploymentConfig.mediumRiskToken.initialSupply
  );
  await mediumRiskToken.waitForDeployment();
  deployedContracts.MediumRiskToken = await mediumRiskToken.getAddress();
  console.log("✅ MediumRiskToken deployed to:", deployedContracts.MediumRiskToken, "\n");
  
  // Deploy HoneypotToken
  console.log("📝 Deploying HoneypotToken...");
  const HoneypotToken = await hre.ethers.getContractFactory("HoneypotToken");
  const honeypotToken = await HoneypotToken.deploy(
    deploymentConfig.honeypotToken.name,
    deploymentConfig.honeypotToken.symbol,
    deploymentConfig.honeypotToken.initialSupply
  );
  await honeypotToken.waitForDeployment();
  deployedContracts.HoneypotToken = await honeypotToken.getAddress();
  console.log("✅ HoneypotToken deployed to:", deployedContracts.HoneypotToken, "\n");
  
  // Deploy RiskFeed
  console.log("📝 Deploying RiskFeed...");
  const RiskFeed = await hre.ethers.getContractFactory("RiskFeed");
  const riskFeed = await RiskFeed.deploy();
  await riskFeed.waitForDeployment();
  deployedContracts.RiskFeed = await riskFeed.getAddress();
  console.log("✅ RiskFeed deployed to:", deployedContracts.RiskFeed, "\n");
  
  // Save deployment information
  const deploymentInfo = {
    network: network,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
    config: deploymentConfig
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath, "\n");
  
  // Export ABIs for the extension
  await exportABIs();
  
  // Print summary
  console.log("🎉 Deployment Summary:");
  console.log("═".repeat(60));
  console.log("SafeToken:        ", deployedContracts.SafeToken);
  console.log("MediumRiskToken:  ", deployedContracts.MediumRiskToken);
  console.log("HoneypotToken:    ", deployedContracts.HoneypotToken);
  console.log("RiskFeed:         ", deployedContracts.RiskFeed);
  console.log("═".repeat(60));
  console.log("\n✨ Next steps:");
  console.log("1. Copy the RiskFeed address to your .env file");
  console.log("2. Update the Chrome extension config with deployed addresses");
  console.log("3. Test the extension with the demo tokens");
  console.log("4. (Optional) Verify contracts on BSCScan\n");
  
  if (network === "bnb_testnet") {
    console.log("🔍 Verify contracts with:");
    console.log(`npx hardhat verify --network bnb_testnet ${deployedContracts.SafeToken} "${deploymentConfig.safeToken.name}" "${deploymentConfig.safeToken.symbol}" ${deploymentConfig.safeToken.initialSupply}`);
    console.log(`npx hardhat verify --network bnb_testnet ${deployedContracts.MediumRiskToken} "${deploymentConfig.mediumRiskToken.name}" "${deploymentConfig.mediumRiskToken.symbol}" ${deploymentConfig.mediumRiskToken.initialSupply}`);
    console.log(`npx hardhat verify --network bnb_testnet ${deployedContracts.HoneypotToken} "${deploymentConfig.honeypotToken.name}" "${deploymentConfig.honeypotToken.symbol}" ${deploymentConfig.honeypotToken.initialSupply}`);
    console.log(`npx hardhat verify --network bnb_testnet ${deployedContracts.RiskFeed}\n`);
  }
}

/**
 * Export contract ABIs for use in the extension
 */
async function exportABIs() {
  console.log("📦 Exporting ABIs...");
  
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const abiExportDir = path.join(__dirname, "..", "..", "bnb-risklens-extension", "riskFeed");
  
  // Create export directory if it doesn't exist
  if (!fs.existsSync(abiExportDir)) {
    fs.mkdirSync(abiExportDir, { recursive: true });
  }
  
  // Export RiskFeed ABI
  const riskFeedArtifact = require(path.join(artifactsDir, "RiskFeed.sol", "RiskFeed.json"));
  fs.writeFileSync(
    path.join(abiExportDir, "RiskFeed.json"),
    JSON.stringify(riskFeedArtifact.abi, null, 2)
  );
  
  // Also export token ABIs for testing
  const safeTokenArtifact = require(path.join(artifactsDir, "SafeToken.sol", "SafeToken.json"));
  fs.writeFileSync(
    path.join(abiExportDir, "SafeToken.json"),
    JSON.stringify(safeTokenArtifact.abi, null, 2)
  );
  
  console.log("✅ ABIs exported to extension directory\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
