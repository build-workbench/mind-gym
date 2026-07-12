const { readFileSync } = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const indexHtmlPath = path.join(repoRoot, 'index.html');

function readScriptSources(html) {
  const sources = [];
  const regex = /<script\s+src="([^"]+)"><\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    sources.push(match[1]);
  }
  return sources;
}

describe('index.html script load order', () => {
  const html = readFileSync(indexHtmlPath, 'utf8');
  const sources = readScriptSources(html);

  test('game-state.js loads after timer.js so its UMD factory captures RememberTimer', () => {
    const timerIdx = sources.indexOf('./src/timer.js');
    const gameStateIdx = sources.indexOf('./src/game-state.js');

    expect(timerIdx).toBeGreaterThanOrEqual(0);
    expect(gameStateIdx).toBeGreaterThanOrEqual(0);
    expect(gameStateIdx).toBeGreaterThan(timerIdx);
  });

  test('game-state.js loads after game-manager.js and shared.js (its UMD dependencies)', () => {
    const sharedIdx = sources.indexOf('./src/shared.js');
    const gameManagerIdx = sources.indexOf('./src/game-manager.js');
    const gameStateIdx = sources.indexOf('./src/game-state.js');

    expect(gameStateIdx).toBeGreaterThan(sharedIdx);
    expect(gameStateIdx).toBeGreaterThan(gameManagerIdx);
  });

  test('app.js loads last so all module globals are available', () => {
    const appIdx = sources.indexOf('./app.js');
    expect(appIdx).toBe(sources.length - 1);
  });
});
