#!/usr/bin/env node
/**
 * Apply the canonical OneLink token palette to Light-mode values in design-system.pen.
 */

import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const penFilePath = path.join(workspaceRoot, 'design', 'design-system.pen');

const lightPaletteOverrides = {
  '--accent': '#eef2ff',
  '--accent-foreground': '#4f46e5',
  '--background': '#f8fafc',
  '--border': '#e2e8f0',
  '--card': '#ffffff',
  '--card-foreground': '#0f172a',
  '--chart-1': '#4f46e5',
  '--chart-2': '#4f46e5',
  '--chart-3': '#4f46e5',
  '--chart-4': '#4f46e5',
  '--chart-5': '#4f46e5',
  '--destructive': '#ef4444',
  '--destructive-foreground': '#ffffff',
  '--font-mono': 'var(--font-inter), "Helvetica Neue", Arial, sans-serif',
  '--font-sans': 'var(--font-inter), "Helvetica Neue", Arial, sans-serif',
  '--font-serif': 'var(--font-inter), "Helvetica Neue", Arial, sans-serif',
  '--foreground': '#0f172a',
  '--input': '#e2e8f0',
  '--muted': '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--popover': '#ffffff',
  '--popover-foreground': '#0f172a',
  '--primary': '#4f46e5',
  '--primary-foreground': '#ffffff',
  '--ring': '#4f46e5',
  '--secondary': '#f1f5f9',
  '--secondary-foreground': '#0f172a',
  '--sidebar': '#ffffff',
  '--sidebar-accent': '#f1f5f9',
  '--sidebar-accent-foreground': '#0f172a',
  '--sidebar-border': '#e2e8f0',
  '--sidebar-foreground': '#0f172a',
  '--sidebar-primary': '#4f46e5',
  '--sidebar-primary-foreground': '#ffffff',
  '--sidebar-ring': '#4f46e5',
};

function applyLightValue(variableDefinition, value) {
  if (!Array.isArray(variableDefinition.value)) {
    variableDefinition.value = value;
    return;
  }

  const existingLightEntry = variableDefinition.value.find(
    (item) => !item.theme || Object.keys(item.theme).length === 0 || item.theme.Mode === 'Light',
  );

  if (existingLightEntry) {
    existingLightEntry.value = value;
    return;
  }

  variableDefinition.value.unshift({ value });
}

function main() {
  const documentText = fs.readFileSync(penFilePath, 'utf8');
  const penDocument = JSON.parse(documentText);
  const variables = penDocument.variables ?? {};

  const missingTokens = [];
  let updatedCount = 0;

  for (const [tokenName, tokenValue] of Object.entries(lightPaletteOverrides)) {
    const variableDefinition = variables[tokenName];
    if (!variableDefinition) {
      missingTokens.push(tokenName);
      continue;
    }

    applyLightValue(variableDefinition, tokenValue);
    updatedCount += 1;
  }

  fs.writeFileSync(penFilePath, `${JSON.stringify(penDocument, null, 2)}\n`, 'utf8');

  if (missingTokens.length > 0) {
    console.warn(
      `Updated ${updatedCount} tokens. Missing tokens: ${missingTokens.join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Updated ${updatedCount} Light-mode token values in ${path.relative(workspaceRoot, penFilePath)}.`);
}

main();
