import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsDir = dirname(scriptDir);
const playDir = resolve(docsDir, 'public/play');
const gitkeep = resolve(playDir, '.gitkeep');
const indexHtml = resolve(playDir, 'index.html');

await mkdir(playDir, { recursive: true });
await writeFile(gitkeep, '', { flag: 'a' });

try {
  await access(indexHtml);
  console.log('sync:play kept existing docs/public/play/index.html');
} catch {
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
      content="Placeholder live demo route while the content shell is being built."
    />
  </head>
  <body>
    <main>
      <h1>Mind Gym Live Demo</h1>
      <p>The playable demo route is being prepared.</p>
    </main>
  </body>
</html>
`,
  );

  console.log('sync:play placeholder created docs/public/play/index.html');
}
