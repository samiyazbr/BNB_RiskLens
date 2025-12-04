const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

/**
 * Build script for BNB RiskLens Chrome Extension
 * Creates a production-ready .zip file
 */

const EXTENSION_DIR = path.join(__dirname, '..', 'bnb-risklens-extension');
const BUILD_DIR = path.join(__dirname, '..', 'extension-build');
const OUTPUT_FILE = path.join(BUILD_DIR, 'bnb-risklens-extension.zip');

async function buildExtension() {
  console.log('🔶 Building BNB RiskLens Extension...\n');

  // Create build directory if it doesn't exist
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  // Create write stream
  const output = fs.createWriteStream(OUTPUT_FILE);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen to events
  output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Extension built successfully!`);
    console.log(`📦 Size: ${sizeInMB} MB`);
    console.log(`📁 Location: ${OUTPUT_FILE}`);
    console.log('\n🚀 Ready to publish to Chrome Web Store!');
  });

  archive.on('error', (err) => {
    console.error('❌ Error building extension:', err);
    throw err;
  });

  // Pipe archive to output file
  archive.pipe(output);

  console.log('📦 Adding files to archive...\n');

  // Add files to archive (exclude node_modules, tests, etc.)
  archive.directory(EXTENSION_DIR, false, (entry) => {
    // Exclude certain files/directories
    const excludePatterns = [
      'node_modules',
      '.git',
      '.DS_Store',
      'Thumbs.db',
      '.env',
      'test',
      '*.map'
    ];

    for (const pattern of excludePatterns) {
      if (entry.name.includes(pattern)) {
        console.log(`⏭️  Skipping: ${entry.name}`);
        return false;
      }
    }

    console.log(`✓ Adding: ${entry.name}`);
    return entry;
  });

  // Finalize the archive
  await archive.finalize();
}

// Run the build
buildExtension().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
