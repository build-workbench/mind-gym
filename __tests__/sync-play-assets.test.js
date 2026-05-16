const { execFileSync } = require('node:child_process');
const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const fixtureRoot = path.join(repoRoot, '.tmp', 'sync-play-assets-test');
const scriptPath = path.join(repoRoot, 'docs', 'scripts', 'sync-play-assets.mjs');

function runSyncPlay() {
  execFileSync(process.execPath, [scriptPath], {
    cwd: fixtureRoot,
    stdio: 'pipe',
  });
}

describe('sync-play-assets script', () => {
  beforeEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
    mkdirSync(fixtureRoot, { recursive: true });
  });

  afterAll(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  test('creates the placeholder page when play index is missing', () => {
    runSyncPlay();

    const playIndex = path.join(fixtureRoot, 'public', 'play', 'index.html');

    expect(existsSync(playIndex)).toBe(true);
    expect(readFileSync(playIndex, 'utf8')).toContain('Mind Gym Live Demo');
  });

  test('preserves an existing play index page', () => {
    const playDir = path.join(fixtureRoot, 'public', 'play');
    const playIndex = path.join(playDir, 'index.html');
    const realPage = '<!doctype html><title>Real demo</title><main>ready</main>';

    mkdirSync(playDir, { recursive: true });
    writeFileSync(playIndex, realPage);

    runSyncPlay();

    expect(readFileSync(playIndex, 'utf8')).toBe(realPage);
  });
});
