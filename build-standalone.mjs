// Builds the standalone cosmos-capital.html and the Netlify cosmos-deploy/ package
// from galactic-raider/dist. Run AFTER `npm run build` inside galactic-raider.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(root, 'galactic-raider', 'dist');

const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const jsFile = fs.readdirSync(path.join(distDir, 'assets')).find(f => f.endsWith('.js'));
let js = fs.readFileSync(path.join(distDir, 'assets', jsFile), 'utf8');

// Escape every </ so the HTML parser never terminates the inline <script> early
// (React's bundle contains literal strings like </svg> and </body>).
js = js.replace(/<\//g, '<\\/');

const errorTrap = `<script>
window.onerror=function(m,s,l,c,e){
  var d=document.getElementById('root');
  if(!d)return;
  d.style.cssText='background:#1a0000;padding:20px;color:#ff5555;font-family:monospace;font-size:13px;min-height:100vh';
  d.textContent='Error line '+l+': '+m+(e?' | '+e.message:'');
};
</script>`;

// Strip the module script tag and any preload <link> tags, then inline at end of body
let base = html
  .replace(/<script[^>]+src="[^"]*\.js"[^>]*><\/script>/g, '')
  .replace(/<link[^>]*\/>/g, '');

// Use function replacement to prevent $& / $' / $` in js from being expanded
const inlineBlock = errorTrap + '\n<script type="text/javascript">' + js + '</script>\n</body>';
const standalone = base.replace('</body>', () => inlineBlock);
fs.writeFileSync(path.join(root, 'cosmos-capital.html'), standalone);
console.log('Wrote cosmos-capital.html', Math.round(standalone.length / 1024) + 'KB');

// Netlify package: same HTML + background music + floating music button
const musicBlock = `
<!-- Background music -->
<audio id="bgm" src="music.wav" loop preload="auto"></audio>
<div id="music-btn" onclick="toggleMusic()" style="position:fixed;bottom:72px;right:10px;z-index:9999;width:36px;height:36px;border-radius:50%;background:rgba(10,22,40,0.90);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.5)" title="Toggle music">🎵</div>
<script>
var _mPlaying=false;var _mAudio=document.getElementById('bgm');
function toggleMusic(){var btn=document.getElementById('music-btn');if(_mPlaying){_mAudio.pause();btn.textContent='🔇';_mPlaying=false;}else{_mAudio.volume=0.35;_mAudio.play().then(function(){btn.textContent='🎵';_mPlaying=true;}).catch(function(){btn.textContent='▶️';});}}
document.addEventListener('click',function(){if(!_mPlaying&&!_mAudio.dataset.tried){_mAudio.dataset.tried='1';_mAudio.volume=0.35;_mAudio.play().then(function(){document.getElementById('music-btn').textContent='🎵';_mPlaying=true;}).catch(function(){});}},{once:true});
</script>
`;

const deployDir = path.join(root, 'cosmos-deploy');
if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir);
const musicEndBlock = musicBlock + '</body>';
const deployHtml = standalone.replace('</body>', () => musicEndBlock);
fs.writeFileSync(path.join(deployDir, 'index.html'), deployHtml);
console.log('Wrote cosmos-deploy/index.html', Math.round(deployHtml.length / 1024) + 'KB');
