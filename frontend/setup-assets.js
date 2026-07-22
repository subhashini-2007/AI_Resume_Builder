const fs = require('fs');
const path = require('path');

let sourceIcon = 'C:/Users/subha/.gemini/antigravity/brain/b46767c1-b5ce-4eea-9ecc-2db400d98194/icon_only_1784698807050.jpg';
let sourceSplash = 'C:/Users/subha/.gemini/antigravity/brain/b46767c1-b5ce-4eea-9ecc-2db400d98194/splash_1784698819385.jpg';

// Fallback to relative project paths if local absolute paths do not exist (e.g., in CI environments)
if (!fs.existsSync(sourceIcon)) {
  console.log('[INFO] Absolute source icon not found. Falling back to local assets/icon.png');
  sourceIcon = path.join(__dirname, 'assets', 'icon.png');
}
if (!fs.existsSync(sourceSplash)) {
  console.log('[INFO] Absolute source splash not found. Falling back to local assets/splash.png');
  sourceSplash = path.join(__dirname, 'assets', 'splash.png');
}

const assetsDir = path.join(__dirname, 'assets');
const publicDir = path.join(__dirname, 'public');
const iconsDir = path.join(publicDir, 'icons');

// Create directories if they do not exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    // If destination exists, remove it first to avoid permissions issues
    if (fs.existsSync(dest)) {
      try {
        fs.unlinkSync(dest);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }
    try {
      fs.copyFileSync(src, dest);
      console.log(`Successfully copied ${path.basename(src)} to ${path.relative(__dirname, dest)}`);
    } catch (err) {
      console.error(`Failed to copy to ${dest}:`, err.message);
    }
  } else {
    console.error(`Source file not found: ${src}`);
  }
}

console.log('Copying Capacitor Assets...');
copyFile(sourceIcon, path.join(assetsDir, 'icon-only.png'));
copyFile(sourceIcon, path.join(assetsDir, 'icon.png'));
copyFile(sourceIcon, path.join(assetsDir, 'icon-foreground.png'));
copyFile(sourceIcon, path.join(assetsDir, 'icon-background.png'));
copyFile(sourceSplash, path.join(assetsDir, 'splash.png'));

console.log('\nCopying PWA Public Assets...');
copyFile(sourceIcon, path.join(publicDir, 'favicon.ico'));
copyFile(sourceIcon, path.join(publicDir, 'apple-touch-icon.png'));
copyFile(sourceIcon, path.join(iconsDir, 'icon-192x192.png'));
copyFile(sourceIcon, path.join(iconsDir, 'icon-512x512.png'));
copyFile(sourceSplash, path.join(publicDir, 'splash.png'));
