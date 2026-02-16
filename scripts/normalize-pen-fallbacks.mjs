#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = process.cwd();
const penPath = resolve(repoRoot, 'design/design-system.pen');

const pen = JSON.parse(readFileSync(penPath, 'utf8'));
const variables = pen.variables ?? {};

let normalizedTokens = 0;

for (const [token, variable] of Object.entries(variables)) {
  const raw = variable?.value;
  if (!Array.isArray(raw)) {
    continue;
  }

  const unscoped = raw.filter((entry) => !entry?.theme);
  if (unscoped.length <= 1) {
    continue;
  }

  const firstUnscoped = unscoped[0];
  const scoped = raw.filter((entry) => entry?.theme);
  variables[token].value = [firstUnscoped, ...scoped];
  normalizedTokens += 1;
}

writeFileSync(penPath, `${JSON.stringify(pen, null, 2)}\n`, 'utf8');

console.log(`Normalized ambiguous fallback tokens: ${normalizedTokens}`);
console.log(`Updated: ${penPath}`);
