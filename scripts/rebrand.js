#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const BRAND_PATH = path.join(ROOT, 'config', 'brand.json');
const FILES = [
  'app.config.ts',
  'package.json',
  'README.md',
  'docs/STORE_SUBMISSION.md',
  '.env.example',
  'config/brand.json',
  'providers/query-provider.tsx',
  'lib/query-client.ts',
  'store/listing.json',
  'content/privacy-policy.ts',
  'content/terms-of-service.ts',
  '.env',
];

function slugify(name) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'app';
}

function assertSafe(label, value) {
  if (!value || /["\\\n\r]/.test(value)) {
    throw new Error(`${label} cannot be empty or contain quotes or line breaks.`);
  }
}

function assertBundleId(value) {
  assertSafe('Bundle ID', value);
  if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(value)) {
    throw new Error('Bundle ID must look like com.brand.app.');
  }
}

function assertScheme(value) {
  assertSafe('URL scheme', value);
  if (!/^[a-z][a-z0-9+.-]*$/.test(value)) {
    throw new Error('URL scheme must start with a letter and use lowercase letters, numbers, +, ., or -.');
  }
}

function assertUrl(value) {
  assertSafe('Supabase URL', value);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Supabase URL must be a valid https URL.');
  }
  if (url.protocol !== 'https:') {
    throw new Error('Supabase URL must start with https://.');
  }
}

function rebrandContents(contents, from, to) {
  const keys = Object.keys(from).sort((left, right) => from[right].length - from[left].length);
  let next = contents;
  keys.forEach((key, index) => {
    if (!from[key]) {
      return;
    }
    next = next.split(from[key]).join(`__BRAND_${index}_${from[key].length}__`);
  });
  keys.forEach((key, index) => {
    if (!from[key]) {
      return;
    }
    next = next.split(`__BRAND_${index}_${from[key].length}__`).join(to[key]);
  });
  return next;
}

function readBrand() {
  return JSON.parse(fs.readFileSync(BRAND_PATH, 'utf8'));
}

function question(rl, label, current) {
  return new Promise((resolve) => {
    rl.question(`${label} (${current}): `, (answer) => {
      resolve(answer.trim() || current);
    });
  });
}

function fromEnvironment(current) {
  const appName = process.env.BRAND_APP_NAME;
  const bundleId = process.env.BRAND_BUNDLE_ID;
  const scheme = process.env.BRAND_SCHEME;
  const supabaseUrl = process.env.BRAND_SUPABASE_URL;
  const revenueCatIosKey = process.env.BRAND_REVENUECAT_IOS_KEY;
  const revenueCatAndroidKey = process.env.BRAND_REVENUECAT_ANDROID_KEY;
  if (!appName && !bundleId && !scheme && !supabaseUrl && !revenueCatIosKey && !revenueCatAndroidKey) {
    return null;
  }
  if (!appName || !bundleId || !scheme || !supabaseUrl || !revenueCatIosKey || !revenueCatAndroidKey) {
    throw new Error(
      'Set all of BRAND_APP_NAME, BRAND_BUNDLE_ID, BRAND_SCHEME, BRAND_SUPABASE_URL, BRAND_REVENUECAT_IOS_KEY, and BRAND_REVENUECAT_ANDROID_KEY.',
    );
  }
  return {
    ...current,
    appName,
    slug: slugify(appName),
    bundleId,
    scheme,
    supabaseUrl,
    revenueCatIosKey,
    revenueCatAndroidKey,
  };
}

async function promptBrand(current) {
  const fromEnv = fromEnvironment(current);
  if (fromEnv) {
    return fromEnv;
  }
  if (!process.stdin.isTTY) {
    throw new Error('Run npm run rename in a terminal, or set the BRAND_* environment variables.');
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const appName = await question(rl, 'App name', current.appName);
    const bundleId = await question(rl, 'Bundle ID', current.bundleId);
    const scheme = await question(rl, 'URL scheme', current.scheme);
    const supabaseUrl = await question(rl, 'Supabase URL', current.supabaseUrl);
    const revenueCatIosKey = await question(rl, 'RevenueCat iOS key', current.revenueCatIosKey);
    const revenueCatAndroidKey = await question(rl, 'RevenueCat Android key', current.revenueCatAndroidKey);
    return {
      appName,
      slug: slugify(appName),
      bundleId,
      scheme,
      supabaseUrl,
      revenueCatIosKey,
      revenueCatAndroidKey,
    };
  } finally {
    rl.close();
  }
}

function validate(next) {
  assertSafe('App name', next.appName);
  assertBundleId(next.bundleId);
  assertScheme(next.scheme);
  assertUrl(next.supabaseUrl);
  assertSafe('RevenueCat iOS key', next.revenueCatIosKey);
  assertSafe('RevenueCat Android key', next.revenueCatAndroidKey);
  if (!/^appl_|^test_/.test(next.revenueCatIosKey)) {
    console.warn('RevenueCat iOS keys usually start with appl_ or test_.');
  }
  if (!/^goog_|^test_/.test(next.revenueCatAndroidKey)) {
    console.warn('RevenueCat Android keys usually start with goog_ or test_.');
  }
}

function applyBrand(from, to) {
  const changed = [];
  FILES.forEach((relativePath) => {
    const absolute = path.join(ROOT, relativePath);
    if (!fs.existsSync(absolute)) {
      return;
    }
    const current = fs.readFileSync(absolute, 'utf8');
    const next = rebrandContents(current, from, to);
    if (next !== current) {
      fs.writeFileSync(absolute, next);
      changed.push(relativePath);
    }
  });
  return changed;
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('npm run rebrand');
    console.log('Prompts for the app name, bundle id, URL scheme, Supabase URL, and RevenueCat keys.');
    console.log('Non-interactive: set BRAND_APP_NAME, BRAND_BUNDLE_ID, BRAND_SCHEME, BRAND_SUPABASE_URL, BRAND_REVENUECAT_IOS_KEY, BRAND_REVENUECAT_ANDROID_KEY.');
    return;
  }

  const current = readBrand();
  const next = await promptBrand(current);
  validate(next);
  const changed = applyBrand(current, next);
  if (changed.length === 0) {
    console.log('No files changed.');
    return;
  }
  console.log(`Updated ${changed.length} file(s):`);
  changed.forEach((file) => console.log(`- ${file}`));
  console.log(`Slug is now ${next.slug}.`);
  console.log('Update the universal link host in app.config.ts, then restart Metro.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  slugify,
  rebrandContents,
  assertBundleId,
  assertScheme,
  assertUrl,
  main,
};
