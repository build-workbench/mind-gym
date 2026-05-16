import { access, cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsDir = dirname(scriptDir);
const repoRoot = dirname(docsDir);
const distDir = resolve(repoRoot, 'dist');
const playDir = resolve(docsDir, 'public/play');
const indexHtml = resolve(playDir, 'index.html');
const stagedMetadataFiles = [
  resolve(playDir, 'index.html'),
  resolve(playDir, 'robots.txt'),
  resolve(playDir, 'sitemap.xml'),
];
const publicBaseUrl = 'https://lessup.github.io/mind-gym/';
const stagedBaseUrl = 'https://lessup.github.io/mind-gym/play/';

function rewritePublicUrls(html) {
  return html.replaceAll(publicBaseUrl, stagedBaseUrl);
}

async function rewriteStagedMetadata() {
  for (const filePath of stagedMetadataFiles) {
    try {
      const contents = await readFile(filePath, 'utf8');
      await writeFile(filePath, rewritePublicUrls(contents));
    } catch {
      // Some dist snapshots intentionally omit optional metadata files.
    }
  }
}

async function stageDistBundle() {
  await rm(playDir, { recursive: true, force: true });
  await cp(distDir, playDir, { recursive: true });
  await rewriteStagedMetadata();

  console.log('sync:play copied dist/ to docs/public/play/');
}

async function ensurePlaceholder() {
  await rm(playDir, { recursive: true, force: true });
  await mkdir(playDir, { recursive: true });
  await writeFile(
    indexHtml,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mind Gym Live Demo</title>
    <meta
      name="description"
      content="The playable demo bundle is unavailable until the app build runs."
    />
  </head>
  <body>
    <main>
      <h1>Mind Gym Live Demo</h1>
      <p>Run <code>npm run build:play</code> to stage the latest playable app.</p>
    </main>
  </body>
</html>
`,
  );

  console.log('sync:play placeholder created docs/public/play/index.html');
}

try {
  await access(distDir);
  await stageDistBundle();
} catch {
  await ensurePlaceholder();
}
