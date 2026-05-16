const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('docs architecture diagrams', () => {
  test.each([
    [
      'docs/en/architecture/system-overview.md',
      '/diagrams/system-overview',
      'System overview diagram',
    ],
    [
      'docs/zh/architecture/system-overview.md',
      '/diagrams/system-overview',
      'System overview diagram',
    ],
    [
      'docs/en/architecture/state-architecture.md',
      '/diagrams/state-architecture',
      'State architecture diagram',
    ],
    [
      'docs/zh/architecture/state-architecture.md',
      '/diagrams/state-architecture',
      'State architecture diagram',
    ],
    [
      'docs/en/architecture/pwa-offline-strategy.md',
      '/diagrams/pwa-request-flow',
      'Request and cache flow diagram',
    ],
    [
      'docs/zh/architecture/pwa-offline-strategy.md',
      '/diagrams/pwa-request-flow',
      'Request and cache flow diagram',
    ],
    [
      'docs/en/architecture/pwa-offline-strategy.md',
      '/diagrams/pwa-update-flow',
      'Update behavior diagram',
    ],
    [
      'docs/zh/architecture/pwa-offline-strategy.md',
      '/diagrams/pwa-update-flow',
      'Update behavior diagram',
    ],
  ])('%s uses the static %s asset', (relativePath, assetPath) => {
    const source = read(relativePath);

    expect(source).toContain(`class="mind-diagram"`);
    expect(source).toContain(`${assetPath}-light.svg`);
    expect(source).toContain(`${assetPath}-dark.svg`);
    expect(source).not.toContain('```mermaid');
  });
});
