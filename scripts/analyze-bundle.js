#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const names = Object.keys(pkg.dependencies ?? {});

function sizeOf(directory) {
  let total = 0;
  if (!fs.existsSync(directory)) return 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) total += sizeOf(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

const rows = names
  .map((name) => ({ name, bytes: sizeOf(path.join(root, 'node_modules', name)) }))
  .sort((left, right) => right.bytes - left.bytes)
  .slice(0, 20);

rows.forEach((row) => {
  console.log(`${(row.bytes / 1024 / 1024).toFixed(1).padStart(6)} MB  ${row.name}`);
});
console.log('This is installed package size, not the minified JavaScript bundle. Run npx expo export for the shipped bundle.');
