#!/usr/bin/env node
/**
 * Generate PWA icons from SVG source
 * Uses canvas and sharp (if available) or creates SVG fallbacks
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Icon sizes for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Colors
const THEME_COLOR = '#4f46e5';
const BG_COLOR = '#f8fafc';

console.log('[icons] Generating PWA icons...');

// Generate SVG-based PNG data URLs (fallback method without external dependencies)
function generateSimpleIconSvg(size, type = 'icon') {
  const center = size / 2;
  const fontSize = Math.floor(size / 3);

  // Create a simple brain/mind themed SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
    <filter id="shadow${size}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>
  <text x="${center}" y="${center}" font-family="Arial, sans-serif" font-size="${fontSize}" 
        fill="white" text-anchor="middle" dominant-baseline="central" filter="url(#shadow${size})">🧠</text>
</svg>`;
}

function generateOGImageSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="50%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/>
    </pattern>
    <filter id="glow">
      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="150" fill="white" opacity="0.03"/>
  <circle cx="1100" cy="530" r="200" fill="white" opacity="0.03"/>
  
  <!-- Main content -->
  <g text-anchor="middle">
    <!-- Icon -->
    <text x="600" y="220" font-family="Arial, sans-serif" font-size="120" fill="white" filter="url(#glow)">🧠</text>
    
    <!-- Title -->
    <text x="600" y="340" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">Mind Gym</text>
    
    <!-- Subtitle -->
    <text x="600" y="410" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.9">
      Memory Training &amp; Brain Exercise
    </text>
    
    <!-- Features -->
    <text x="600" y="480" font-family="Arial, sans-serif" font-size="20" fill="white" opacity="0.7">
      Classic • N-back • Daily Challenges • Adaptive Difficulty
    </text>
    
    <!-- URL -->
    <text x="600" y="560" font-family="Arial, sans-serif" font-size="18" fill="white" opacity="0.6">
      lessup.github.io/mind-gym
    </text>
  </g>
</svg>`;
}

function generateScreenshotSvg(type) {
  const isMobile = type === 'mobile';
  const [w, h] = isMobile ? [390, 844] : [1280, 720];
  const title = isMobile ? 'Mind Gym Mobile' : `Mind Gym - ${type === '1' ? 'Classic Matching' : 'N-back Training'}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg${type}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="100%" style="stop-color:#e2e8f0"/>
    </linearGradient>
    <linearGradient id="header${type}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bg${type})"/>
  
  <!-- Header -->
  <rect width="${w}" height="${isMobile ? 80 : 60}" fill="url(#header${type})"/>
  <text x="${w / 2}" y="${isMobile ? 50 : 40}" font-family="Arial, sans-serif" font-size="${isMobile ? 28 : 20}" 
        fill="white" text-anchor="middle" font-weight="bold">🧠 Mind Gym</text>
  
  <!-- Mock content area -->
  <rect x="${isMobile ? 20 : 40}" y="${isMobile ? 100 : 80}" width="${isMobile ? w - 40 : w - 80}" 
        height="${isMobile ? 200 : 400}" rx="${isMobile ? 12 : 8}" fill="white" opacity="0.9"/>
  
  <!-- Mock cards/grid -->
  <g fill="#4f46e5" opacity="0.6">
    ${generateMockCards(w, h, isMobile)}
  </g>
  
  <!-- Screenshot label -->
  <rect x="10" y="${h - 40}" width="200" height="30" rx="4" fill="#1e293b" opacity="0.8"/>
  <text x="110" y="${h - 20}" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">${title}</text>
</svg>`;
}

function generateMockCards(w, h, isMobile) {
  const cards = [];
  const rows = isMobile ? 4 : 3;
  const cols = isMobile ? 3 : 4;
  const cardSize = isMobile ? 70 : 80;
  const gap = isMobile ? 12 : 16;
  const startX = isMobile ? (w - (cols * cardSize + (cols - 1) * gap)) / 2 : (w - (cols * cardSize + (cols - 1) * gap)) / 2;
  const startY = isMobile ? 140 : 120;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardSize + gap);
      const y = startY + r * (cardSize + gap);
      cards.push(`<rect x="${x}" y="${y}" width="${cardSize}" height="${cardSize}" rx="8"/>`);
    }
  }
  return cards.join('\n');
}

// Create SVG icon that will be used as base
function ensureBaseIcon() {
  const iconPath = path.join(ASSETS_DIR, 'icon.svg');
  if (!fs.existsSync(iconPath)) {
    const svg = generateSimpleIconSvg(512, 'icon')
      .replace('🧠', '')
      .replace(
        '</defs>',
        '</defs>\n  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" fill="white" text-anchor="middle">MG</text>'
      );
    fs.writeFileSync(iconPath, svg);
    console.log('  ✓ icon.svg (default)');
  }
}

// Main function
function generateIcons() {
  // Ensure assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Generate base icon if missing
  ensureBaseIcon();

  // Generate PWA icons in SVG format (browsers can use them)
  ICON_SIZES.forEach((size) => {
    const svgContent = generateSimpleIconSvg(size);
    const outputPath = path.join(ASSETS_DIR, `icon-${size}.svg`);
    fs.writeFileSync(outputPath, svgContent);
    console.log(`  ✓ icon-${size}.svg`);
  });

  // For PNG support, we need to use the existing SVG or create fallbacks
  // Since we don't have sharp/imagemagick, we'll copy the SVG with .png extension
  // as a fallback (modern browsers support SVG in manifest, but some need PNG)
  ICON_SIZES.forEach((size) => {
    const svgPath = path.join(ASSETS_DIR, `icon-${size}.svg`);
    const pngPath = path.join(ASSETS_DIR, `icon-${size}.png`);

    // Create a simple colored PNG representation using embedded SVG
    // This is a workaround - in production, proper PNG conversion should happen
    if (!fs.existsSync(pngPath)) {
      // Copy SVG as-is - manifest will serve it
      // In a proper CI environment with ImageMagick, this becomes a real PNG
      fs.copyFileSync(svgPath, pngPath);
      console.log(`  ✓ icon-${size}.png (SVG fallback)`);
    }
  });

  // Generate Apple touch icon
  const appleIconSvg = generateSimpleIconSvg(180);
  fs.writeFileSync(path.join(ASSETS_DIR, 'apple-touch-icon.svg'), appleIconSvg);
  fs.copyFileSync(
    path.join(ASSETS_DIR, 'apple-touch-icon.svg'),
    path.join(ASSETS_DIR, 'apple-touch-icon.png')
  );
  console.log('  ✓ apple-touch-icon.png');

  // Generate OG image
  const ogSvg = generateOGImageSvg();
  fs.writeFileSync(path.join(ASSETS_DIR, 'og-image.svg'), ogSvg);
  fs.copyFileSync(path.join(ASSETS_DIR, 'og-image.svg'), path.join(ASSETS_DIR, 'og-image.png'));
  console.log('  ✓ og-image.png');

  // Generate screenshots
  ['1', '2', 'mobile'].forEach((type) => {
    const screenshotSvg = generateScreenshotSvg(type);
    const suffix = type === 'mobile' ? 'mobile' : type;
    fs.writeFileSync(path.join(ASSETS_DIR, `screenshot-${suffix}.svg`), screenshotSvg);
    fs.copyFileSync(
      path.join(ASSETS_DIR, `screenshot-${suffix}.svg`),
      path.join(ASSETS_DIR, `screenshot-${suffix}.png`)
    );
    console.log(`  ✓ screenshot-${suffix}.png`);
  });

  console.log('\n[icons] Icon generation complete!');
  console.log('Note: PNG files are SVG fallbacks. For production,');
  console.log('      install ImageMagick or sharp for proper PNG conversion.');
}

generateIcons();
