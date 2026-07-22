const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

try {
  console.log('Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });

  const outDir = path.join(__dirname, 'out');
  const distDir = path.join(__dirname, 'dist');

  console.log('Cleaning old dist folder...');
  cleanDirectory(distDir);

  if (fs.existsSync(outDir)) {
    console.log('Renaming out folder to dist...');
    fs.renameSync(outDir, distDir);
    console.log('Build output successfully copied to dist!');
  } else {
    throw new Error('Next.js build succeeded but "out" directory was not found.');
  }
} catch (error) {
  console.error('Build process failed:', error);
  process.exit(1);
}
