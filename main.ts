// A working gta6-01 entry (Node 22, standard library only): the game is this directory's
// game/ folder, plain static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and the program hands it in. It copies game/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library. Only the plumbing, not an open world: Block
// Dodger, a plain 2D canvas game where a paddle dodges falling blocks and catches coins, with a
// title screen, score, lives and levels, game over and restart, flat colours and no sound. Build
// your own open-world crime game in its place (three.js or any library you vendor under game/),
// put your 3 or 4 PNG or JPEG screenshots in screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const GAME_TITLE = 'Costa Serena';
const GAME_VERSION = '1.0.10';
console.log(`Packaging ${GAME_TITLE} v${GAME_VERSION}`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Validate the source assets after the dossier is written. This preflight is read-only, so the
// bytes copied to the output directory stay deterministic across runs.
const collectFiles = (dir: string): string[] => {
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const child = join(dir, name);
    const info = statSync(child);
    if (info.isDirectory()) files.push(...collectFiles(child));
    else if (info.isFile()) files.push(child);
  }
  return files;
};
const gameFiles = collectFiles(join(here, 'game'));
const gameBytes = gameFiles.reduce((total, path) => total + statSync(path).size, 0);
const screenshotsFiles = collectFiles(join(here, 'screenshots'));
for (const path of screenshotsFiles) {
  const info = statSync(path);
  if (info.size > 256 * 1024) throw new Error(`Packaging limit exceeded: ${path} exceeds 256 KiB (${info.size} bytes)`);
  const magic = readFileSync(path).subarray(0, 4);
  const jpeg = magic.length >= 2 && magic[0] === 0xff && magic[1] === 0xd8;
  const png = magic.length >= 4 && magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4e && magic[3] === 0x47;
  if (!jpeg && !png) throw new Error(`Packaging limit exceeded: ${path} has invalid image magic bytes`);
}
console.log(`Preflight game/: ${gameFiles.length} files, ${gameBytes} bytes`);
console.log(`Preflight screenshots/: ${screenshotsFiles.length} files`);
if (gameFiles.length > 993) throw new Error(`Packaging limit exceeded: ${gameFiles[993]} puts game/ over 993 entries`);
if (gameBytes > 48 * 1024 * 1024) throw new Error(`Packaging limit exceeded: ${gameFiles.at(-1) ?? join(here, 'game')} puts game/ over 48 MiB (${gameBytes} bytes)`);
