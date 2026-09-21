#!/usr/bin/env node
/**
 * Regenerates `src/data/games.ts` from the app's own GAME_CATALOG.md.
 *
 * That file is generated from the Flutter registry, so this chain means the
 * website can never advertise a game the app does not ship, or get a
 * description, difficulty or category wrong.
 *
 * Run after changing the app's game list:
 *   (in the Flutter project)  flutter test tool/generate_catalog_test.dart
 *   (here)                    npm run sync:games
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const source = resolve(root, '../GAME_CATALOG.md');

if (!existsSync(source)) {
  console.error(`\n  GAME_CATALOG.md not found at:\n    ${source}\n`);
  console.error('  Generate it from the Flutter project first:');
  console.error('    flutter test tool/generate_catalog_test.dart\n');
  process.exit(1);
}

const CATEGORY_META = {
  'Retro Arcade': { id: 'arcade', accent: 'magenta' },
  Puzzle: { id: 'puzzle', accent: 'violet' },
  Math: { id: 'math', accent: 'cyan' },
  Memory: { id: 'memory', accent: 'lime' },
  Reaction: { id: 'reaction', accent: 'amber' },
  'Word Games': { id: 'word', accent: 'azure' },
  Logic: { id: 'logic', accent: 'mint' },
};

const md = readFileSync(source, 'utf8');
const games = [];
const categories = [];

for (const block of md.split('\n## ').slice(1)) {
  const label = block.split('\n')[0].trim();
  if (!CATEGORY_META[label]) continue;

  const blurb = block.match(/^_(.+?)_$/m)?.[1] ?? '';
  let count = 0;

  for (const entry of block.split('\n### ').slice(1)) {
    const name = entry.split('\n')[0].trim();
    const field = (key) =>
      entry.match(new RegExp(`^\\| ${key} \\| (.+?) \\|$`, 'm'))?.[1]?.trim() ?? '';

    const description =
      entry.match(/^> .+\n\n([\s\S]+?)\n\n\| \|/m)?.[1].replace(/\s+/g, ' ').trim() ?? '';

    games.push({
      id: field('id').replace(/`/g, ''),
      name,
      tagline: entry.match(/^> (.+)$/m)?.[1].trim() ?? '',
      description,
      category: CATEGORY_META[label].id,
      difficulties: field('Difficulties').split(',').map((s) => s.trim()).filter(Boolean),
      session: field('Typical session'),
      tags: field('Search tags').split(',').map((s) => s.trim()).filter(Boolean),
      offline: field('Offline') === 'yes',
      howToPlay: (entry.split('**How to play**')[1] ?? '')
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.slice(2).trim()),
    });
    count += 1;
  }

  categories.push({ ...CATEGORY_META[label], label, blurb, count });
}

const q = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const list = (values) => `[${values.map(q).join(', ')}]`;

const out = `${readFileSync(resolve(root, 'src/data/games.ts'), 'utf8').split('export const CATEGORIES')[0]}export const CATEGORIES: Category[] = [
${categories
  .map(
    (c) =>
      `  { id: ${q(c.id)}, label: ${q(c.label)}, blurb: ${q(c.blurb)}, accent: ${q(c.accent)}, count: ${c.count} },`,
  )
  .join('\n')}
];

export const GAMES: Game[] = [
${games
  .map(
    (g) => `  {
    id: ${q(g.id)},
    name: ${q(g.name)},
    tagline: ${q(g.tagline)},
    description: ${q(g.description)},
    category: ${q(g.category)},
    difficulties: ${list(g.difficulties)},
    session: ${q(g.session)},
    tags: ${list(g.tags)},
    offline: ${g.offline},
    howToPlay: ${list(g.howToPlay)},
  },`,
  )
  .join('\n')}
];

${readFileSync(resolve(root, 'src/data/games.ts'), 'utf8').split('export const GAME_COUNT')[1] ? `export const GAME_COUNT${readFileSync(resolve(root, 'src/data/games.ts'), 'utf8').split('export const GAME_COUNT')[1]}` : ''}`;

writeFileSync(resolve(root, 'src/data/games.ts'), out);
console.log(`\n  Wrote src/data/games.ts — ${games.length} games across ${categories.length} categories.\n`);
