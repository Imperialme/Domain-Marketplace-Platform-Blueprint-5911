/**
 * Asset generation script for Domain Sniper
 * Run with: node src/utils/generateAssets.js
 * Requires: npm install canvas (or use a PNG editor)
 *
 * This script generates placeholder assets. For production, replace with
 * professionally designed assets at 1024x1024 (icon) and 1284x2778 (splash).
 */

const ASSET_SPECS = {
  'assets/icon.png':         { size: 1024, desc: 'App icon - crosshair/target on dark gradient' },
  'assets/splash.png':       { size: '1284x2778', desc: 'Splash screen - logo centered on dark bg' },
  'assets/adaptive-icon.png':{ size: 1024, desc: 'Android adaptive icon foreground' },
  'assets/favicon.png':      { size: 32, desc: 'Web favicon' },
};

console.log('Asset specifications for Domain Sniper:');
Object.entries(ASSET_SPECS).forEach(([file, spec]) => {
  console.log(`  ${file}: ${spec.size}px — ${spec.desc}`);
});
console.log('\nPlace PNG files at the paths above before building.');
