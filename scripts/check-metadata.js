#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'store', 'listing.json');
const listing = JSON.parse(fs.readFileSync(file, 'utf8'));
const text = JSON.stringify(listing);
const banned = [/\bfree\b/i, /\bcheap\b/i, /\$\s?\d/, /€\s?\d/, /\bdiscount\b/i, /\bsale\b/i];
const hits = banned.filter((pattern) => pattern.test(text));

if (hits.length > 0) {
  console.error('Store listing contains pricing or promotional claims.');
  process.exit(1);
}

console.log('Store listing metadata is clear of pricing claims.');
