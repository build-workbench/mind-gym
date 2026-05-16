const { readFileSync } = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const docsConfigPath = path.join(repoRoot, 'docs', '.vitepress', 'config.ts');
const workflowPaths = [
  path.join(repoRoot, '.github', 'workflows', 'ci-docs.yml'),
  path.join(repoRoot, '.github', 'workflows', 'docs-pages.yml'),
];
const requiredRootArtifacts = [
  'app.js',
  'index.html',
  '404.html',
  'offline.html',
  'manifest.webmanifest',
  'sw.js',
  'robots.txt',
  'sitemap.xml',
  'browserconfig.xml',
];

function read(relativePath) {
  return readFileSync(relativePath, 'utf8');
}

function extractPathFilters(workflowSource) {
  return workflowSource
    .split('\n')
    .map(line => line.match(/^\s+- '([^']+)'$/)?.[1])
    .filter(Boolean);
}

describe('docs deployment configuration', () => {
  test('disables VitePress clean URLs for static GitHub Pages deep links', () => {
    const configSource = read(docsConfigPath);

    expect(configSource).not.toMatch(/cleanUrls\s*:\s*true/);
  });

  test.each(workflowPaths)('%s tracks every staged root play artifact', workflowPath => {
    const workflowSource = read(workflowPath);
    const configuredPaths = extractPathFilters(workflowSource);

    expect(configuredPaths).toEqual(expect.arrayContaining(requiredRootArtifacts));
  });
});
