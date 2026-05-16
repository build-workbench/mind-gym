const { execFileSync } = require('node:child_process');
const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const fixtureRoot = path.join(repoRoot, '.tmp', 'sync-play-assets-test');
const sourceScriptPath = path.join(repoRoot, 'docs', 'scripts', 'sync-play-assets.mjs');
const scriptPath = path.join(fixtureRoot, 'docs', 'scripts', 'sync-play-assets.mjs');

function runSyncPlay() {
  return execFileSync(process.execPath, [scriptPath], {
    cwd: fixtureRoot,
    stdio: 'pipe',
  }).toString();
}

function writeFile(relativePath, content) {
  const filePath = path.join(fixtureRoot, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  return filePath;
}

describe('sync-play-assets script', () => {
  beforeEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
    mkdirSync(path.dirname(scriptPath), { recursive: true });
    copyFileSync(sourceScriptPath, scriptPath);
    mkdirSync(fixtureRoot, { recursive: true });
  });

  afterAll(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  test('creates the placeholder page when play index is missing', () => {
    const output = runSyncPlay();

    const playIndex = path.join(fixtureRoot, 'docs', 'public', 'play', 'index.html');

    expect(existsSync(playIndex)).toBe(true);
    expect(readFileSync(playIndex, 'utf8')).toContain('Mind Gym Live Demo');
    expect(output).toContain('placeholder created');
  });

  test('replaces stale play output with the placeholder when dist is missing', () => {
    const playDir = path.join(fixtureRoot, 'docs', 'public', 'play');
    const playIndex = path.join(playDir, 'index.html');
    const staleAsset = path.join(playDir, 'assets', 'stale.txt');
    const stalePage = '<!doctype html><title>Real demo</title><main>ready</main>';

    mkdirSync(playDir, { recursive: true });
    mkdirSync(path.dirname(staleAsset), { recursive: true });
    writeFileSync(playIndex, stalePage);
    writeFileSync(staleAsset, 'stale');

    runSyncPlay();

    expect(readFileSync(playIndex, 'utf8')).toContain('Mind Gym Live Demo');
    expect(existsSync(staleAsset)).toBe(false);
  });

  test('copies the dist app into docs/public/play and rewrites public metadata URLs', () => {
    writeFile(
      'dist/index.html',
      `<!doctype html>
<html lang="en">
  <head>
    <link rel="canonical" href="https://lessup.github.io/mind-gym/" />
    <meta property="og:url" content="https://lessup.github.io/mind-gym/" />
    <meta name="twitter:url" content="https://lessup.github.io/mind-gym/" />
    <meta property="og:image" content="https://lessup.github.io/mind-gym/assets/og-image.png" />
    <meta name="twitter:image" content="https://lessup.github.io/mind-gym/assets/og-image.png" />
    <script type="application/ld+json">
      {"url":"https://lessup.github.io/mind-gym/"}
    </script>
  </head>
  <body>
    <main>Playable app</main>
  </body>
</html>
`
    );
    writeFile('dist/robots.txt', 'Sitemap: https://lessup.github.io/mind-gym/sitemap.xml\n');
    writeFile(
      'dist/sitemap.xml',
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lessup.github.io/mind-gym/</loc>
  </url>
</urlset>
`
    );
    writeFile('dist/assets/app.css', 'body { color: rebeccapurple; }');
    writeFile('docs/public/play/index.html', '<!doctype html><title>Placeholder</title>');

    const output = runSyncPlay();
    const playDir = path.join(fixtureRoot, 'docs', 'public', 'play');
    const playIndex = path.join(playDir, 'index.html');
    const stagedIndex = readFileSync(playIndex, 'utf8');
    const stagedRobots = readFileSync(path.join(playDir, 'robots.txt'), 'utf8');
    const stagedSitemap = readFileSync(path.join(playDir, 'sitemap.xml'), 'utf8');

    expect(output).toContain('copied dist/ to docs/public/play/');
    expect(stagedIndex).toContain('Playable app');
    expect(stagedIndex).toContain('https://lessup.github.io/mind-gym/play/');
    expect(stagedIndex).toContain('https://lessup.github.io/mind-gym/play/assets/og-image.png');
    expect(stagedRobots).toContain('Sitemap: https://lessup.github.io/mind-gym/play/sitemap.xml');
    expect(stagedSitemap).toContain('<loc>https://lessup.github.io/mind-gym/play/</loc>');
    expect(stagedIndex).not.toContain('<title>Placeholder</title>');
    expect(readFileSync(path.join(playDir, 'assets', 'app.css'), 'utf8')).toContain(
      'rebeccapurple'
    );
  });
});
