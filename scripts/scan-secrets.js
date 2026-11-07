#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skip = new Set(['node_modules', '.git', '.expo', 'dist', 'coverage', 'ios', 'android']);
const serviceRoleAssignment = new RegExp(`${['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_')}=(?!$|your-|<)`);
const patterns = [
  /sk_live_[A-Za-z0-9]+/,
  /sk-proj-[A-Za-z0-9]/,
  /BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY/,
  /AKIA[0-9A-Z]{16}/,
  serviceRoleAssignment,
];

const findings = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.isFile() || entry.name === 'package-lock.json' || entry.name.endsWith('.png') || entry.name.endsWith('.webp')) continue;
    const text = fs.readFileSync(full, 'utf8');
    patterns.forEach((pattern) => {
      if (pattern.test(text)) {
        findings.push(`${path.relative(root, full)} matches ${pattern}`);
      }
    });
  }
}

walk(root);

if (findings.length > 0) {
  findings.forEach((finding) => console.error(finding));
  process.exit(1);
}

console.log('No committed secrets found.');
