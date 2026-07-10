import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url);
const SEARCH_DIRECTORIES = ['src'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs']);
const FORBIDDEN = [
  { label: 'unfinished marker', expression: /\b(?:TODO|FIXME|HACK|XXX)\b/ },
  { label: 'TypeScript any escape hatch', expression: /\bas\s+any\b|:\s*any\b|<any>/ },
  { label: 'disabled test', expression: /\b(?:it|test|describe)\.(?:skip|todo)\b/ },
  { label: 'focused test', expression: /\b(?:it|test|describe)\.only\b/ },
];

const failures = [];
for (const directory of SEARCH_DIRECTORIES) await walk(new URL(`${directory}/`, ROOT));
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Source validation passed.');
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) await walk(url);
    else if (SOURCE_EXTENSIONS.has(extname(entry.name))) await inspect(url);
  }
}

async function inspect(url) {
  const content = await readFile(url, 'utf8');
  const path = relative(new URL('.', ROOT).pathname, url.pathname);
  for (const rule of FORBIDDEN) {
    const match = rule.expression.exec(content);
    if (match === null) continue;
    const line = content.slice(0, match.index).split('\n').length;
    failures.push(`${path}:${line}: ${rule.label}: ${match[0]}`);
  }
}
