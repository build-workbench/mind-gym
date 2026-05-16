import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const playDir = resolve('public/play');
const gitkeep = resolve(playDir, '.gitkeep');

await mkdir(dirname(gitkeep), { recursive: true });
await writeFile(gitkeep, '', { flag: 'a' });

console.log('sync:play placeholder created public/play/.gitkeep');
