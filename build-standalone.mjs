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

// Netlify package: multi-track music playlist system
const musicBlock = `
<!-- Music playlist system -->
<audio id="bgm" loop preload="auto" style="display:none"></audio>
<div id="music-menu" style="position:fixed;bottom:72px;right:10px;z-index:9999;background:rgba(10,22,40,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:0;min-width:200px;max-width:250px;box-shadow:0 4px 16px rgba(0,0,0,0.6);display:none;flex-direction:column" onmouseleave="closeMusicMenu()">
  <div style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:12px;font-weight:bold;color:rgba(255,255,255,0.8)">🎵 Playlist</div>
  <div style="overflow-y:auto;max-height:200px">
    <button onclick="selectTrack('music_oasis_of_sol')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05)" title="Oasis of Sol">🏜️ Oasis of Sol</button>
    <button onclick="selectTrack('music_quiet_capital')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05)" title="The Quiet Capital">🌆 The Quiet Capital</button>
    <button onclick="selectTrack('music_nocturnal_raider_2')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05)" title="Nocturnal Raider II">🌙 Nocturnal Raider II</button>
    <button onclick="selectTrack('music_nocturnal_raider_7')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05)" title="Nocturnal Raider VII">🌙 Nocturnal Raider VII</button>
    <button onclick="selectTrack('music_deep_space')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05)" title="Deep Space Solitude">🌌 Deep Space Solitude</button>
    <button onclick="selectTrack('music_planetary_oversight')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05)" title="Planetary Oversight">🪐 Planetary Oversight</button>
    <button onclick="selectTrack('music_solar_drift')" style="width:100%;padding:8px 12px;text-align:left;background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;" title="Solar Drift">☀️ Solar Drift</button>
  </div>
</div>
<div id="music-btn" onclick="toggleMusicMenu()" style="position:fixed;bottom:72px;right:10px;z-index:9999;width:36px;height:36px;border-radius:50%;background:rgba(10,22,40,0.90);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.5)" title="Open music menu">🎵</div>
<script>
var _mPlaying=false;var _mAudio=document.getElementById('bgm');var _currentTrack='music_oasis_of_sol';var _tracks={
  'music_oasis_of_sol':'music_oasis_of_sol.mp3',
  'music_quiet_capital':'music_quiet_capital.mp3',
  'music_nocturnal_raider_2':'music_nocturnal_raider_2.mp3',
  'music_nocturnal_raider_7':'music_nocturnal_raider_7.mp3',
  'music_deep_space':'music_deep_space.mp3',
  'music_planetary_oversight':'music_planetary_oversight.mp3',
  'music_solar_drift':'music_solar_drift.mp3'
};
function toggleMusicMenu(){var menu=document.getElementById('music-menu');menu.style.display=menu.style.display==='flex'?'none':'flex';}
function closeMusicMenu(){document.getElementById('music-menu').style.display='none';}
function selectTrack(trackId){_currentTrack=trackId;_mAudio.src=_tracks[trackId];var wasPlaying=_mPlaying;if(wasPlaying)_mAudio.pause();_mAudio.src=_tracks[trackId];if(wasPlaying){_mAudio.volume=0.35;_mAudio.play().catch(function(){});}}
function toggleMusic(){var btn=document.getElementById('music-btn');if(_mPlaying){_mAudio.pause();btn.textContent='🔇';_mPlaying=false;}else{_mAudio.src=_tracks[_currentTrack];_mAudio.volume=0.35;_mAudio.play().then(function(){btn.textContent='🎵';_mPlaying=true;}).catch(function(){btn.textContent='▶️';});}}
document.addEventListener('click',function(){if(!_mPlaying&&!_mAudio.dataset.tried){_mAudio.dataset.tried='1';_mAudio.src=_tracks[_currentTrack];_mAudio.volume=0.35;_mAudio.play().then(function(){document.getElementById('music-btn').textContent='🎵';_mPlaying=true;}).catch(function(){});}},{once:true});
</script>
`;

const deployDir = path.join(root, 'cosmos-deploy');
if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir);
const musicEndBlock = musicBlock + '</body>';
const deployHtml = standalone.replace('</body>', () => musicEndBlock);
fs.writeFileSync(path.join(deployDir, 'index.html'), deployHtml);
console.log('Wrote cosmos-deploy/index.html', Math.round(deployHtml.length / 1024) + 'KB');
