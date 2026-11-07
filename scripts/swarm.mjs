#!/usr/bin/env node

/**
 * create-filip-app - Command Swarm Engine
 *
 * Automates project initialization, master key resolution (Expo & RevenueCat),
 * project rebranding, feature pruning, and npm package unlinking.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// -----------------------------------------------------------------------------
// Feature Definitions & Associated NPM Packages
// -----------------------------------------------------------------------------
const FEATURES = {
  paywall: {
    name: 'RevenueCat Paywall & In-App Purchases',
    packages: ['react-native-purchases'],
    files: [
      'app/(tabs)/paywall.tsx',
      'components/paywall',
      'hooks/useRevenueCat.ts',
      'lib/paywall-order.ts',
    ],
    tabName: 'paywall',
  },
  ai: {
    name: 'AI Assistant & Local Runtime',
    packages: ['expo-sqlite'],
    files: [
      'app/(tabs)/ai.tsx',
      'components/ai',
      'hooks/useAI.ts',
      'lib/ai',
    ],
    tabName: 'ai',
  },
  premade: {
    name: 'Premade API Components (Maps, Weather, FX, Compressor)',
    packages: ['expo-image-manipulator'],
    files: [
      'app/(tabs)/components.tsx',
      'components/premade',
    ],
    tabName: 'components',
  },
  camera: {
    name: 'Native Camera Modules',
    packages: ['expo-camera'],
    files: [],
  },
  notifications: {
    name: 'Push & Local Notifications',
    packages: ['expo-notifications'],
    files: [],
  },
};

// -----------------------------------------------------------------------------
// Master Key Resolver
// -----------------------------------------------------------------------------
function readEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
}

function redact(text, secrets) {
  let out = String(text).slice(0, 400);
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join('[redacted]');
  }
  return out;
}

function upsertEnv(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content.replace(/\n*$/, '')}\n${line}\n`;
}

function loadMasterKeys() {
  readEnvFile(path.join(ROOT, '.env'));
  const keys = {
    expo: process.env.EXPO_MAIN_KEY || process.env.EXPO_TOKEN || null,
    revenuecat: process.env.REVENUECAT_MAIN_KEY || process.env.REVENUECAT_SECRET_KEY || null,
  };

  const keyFiles = [
    path.join(process.env.HOME || '', '.config', 'expo-universal', 'keys.json'),
    path.join(ROOT, '.swarm-keys.json'),
    path.join(ROOT, 'keys.json'),
  ];

  for (const file of keyFiles) {
    if (fs.existsSync(file)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!keys.expo) {
          keys.expo = parsed.expo?.mainKey || parsed.expo?.token || parsed.EXPO_TOKEN || null;
        }
        if (!keys.revenuecat) {
          keys.revenuecat =
            parsed.revenuecat?.mainKey ||
            parsed.revenuecat?.secretKey ||
            parsed.REVENUECAT_SECRET_KEY ||
            null;
        }
      } catch {
        // Ignore unreadable files
      }
    }
  }

  return keys;
}

// -----------------------------------------------------------------------------
// Auto-Provisioning: Expo / EAS
// -----------------------------------------------------------------------------
async function expoGraphql(token, query, variables) {
  const res = await fetch('https://api.expo.dev/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  return { status: res.status, body, text };
}

async function provisionExpoProject(appName, slug, token) {
  if (!token) {
    console.log('Expo mainKey missing. Skipping Expo project creation.');
    return null;
  }

  console.log(`Provisioning Expo project "${slug}"…`);
  try {
    const me = await expoGraphql(
      token,
      `query Me { meActor { id accounts { id name } } }`,
    );
    const actor = me.body?.data?.meActor;
    const account = actor?.accounts?.[0];
    if (!account?.id) {
      const message = me.body?.errors?.map((error) => error.message).join('; ') || me.text;
      console.warn(`Expo account lookup failed (${me.status}): ${redact(message, [token])}`);
      return null;
    }

    const created = await expoGraphql(
      token,
      `mutation CreateApp($appInput: AppInput!) {
        app { createApp(appInput: $appInput) { id } }
      }`,
      { appInput: { accountId: account.id, projectName: slug } },
    );
    const projectId = created.body?.data?.app?.createApp?.id;
    if (!projectId) {
      const message = created.body?.errors?.map((error) => error.message).join('; ') || created.text;
      console.warn(`Expo project creation failed (${created.status}): ${redact(message, [token])}`);
      return null;
    }

    console.log(`Expo project created on @${account.name}: ${projectId}`);
    return projectId;
  } catch (err) {
    console.warn(`Could not reach Expo API: ${err.message}`);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Auto-Provisioning: RevenueCat
// -----------------------------------------------------------------------------
async function revenueCat(masterKey, pathname, method, body) {
  const res = await fetch(`https://api.revenuecat.com/v2${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${masterKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text };
}

async function publicSdkKey(masterKey, projectId, appId) {
  const listed = await revenueCat(masterKey, `/projects/${projectId}/apps/${appId}/public_api_keys`, 'GET');
  if (!listed.ok) {
    console.warn(`RevenueCat public keys failed (${listed.status}): ${redact(listed.json?.message || listed.text, [masterKey])}`);
    return null;
  }
  const items = listed.json?.items || [];
  const production = items.find((item) => item.environment === 'production') || items[0];
  return production?.key || null;
}

async function provisionRevenueCat(appName, bundleId, masterKey) {
  if (!masterKey) {
    console.log('RevenueCat mainKey missing. Skipping RevenueCat project creation.');
    return null;
  }

  console.log(`Provisioning RevenueCat project for "${appName}"…`);
  try {
    const project = await revenueCat(masterKey, '/projects', 'POST', { name: appName });
    if (!project.ok || !project.json?.id) {
      console.warn(`RevenueCat project failed (${project.status}): ${redact(project.json?.message || project.text, [masterKey])}`);
      return null;
    }
    const projectId = project.json.id;
    console.log(`RevenueCat project created: ${projectId}`);

    const ios = await revenueCat(masterKey, `/projects/${projectId}/apps`, 'POST', {
      name: `${appName} iOS`,
      type: 'app_store',
      app_store: { bundle_id: bundleId },
    });
    const android = await revenueCat(masterKey, `/projects/${projectId}/apps`, 'POST', {
      name: `${appName} Android`,
      type: 'play_store',
      play_store: { package_name: bundleId },
    });
    if (!ios.ok) {
      console.warn(`RevenueCat iOS app failed (${ios.status}): ${redact(ios.json?.message || ios.text, [masterKey])}`);
    }
    if (!android.ok) {
      console.warn(`RevenueCat Android app failed (${android.status}): ${redact(android.json?.message || android.text, [masterKey])}`);
    }

    const entitlement = await revenueCat(masterKey, `/projects/${projectId}/entitlements`, 'POST', {
      lookup_key: 'pro',
      display_name: 'Pro Access',
    });
    if (!entitlement.ok) {
      console.warn(`RevenueCat entitlement failed (${entitlement.status}): ${redact(entitlement.json?.message || entitlement.text, [masterKey])}`);
    }

    const iosKey = ios.json?.id ? await publicSdkKey(masterKey, projectId, ios.json.id) : null;
    const androidKey = android.json?.id ? await publicSdkKey(masterKey, projectId, android.json.id) : null;
    if (!iosKey || !androidKey) return null;

    console.log('RevenueCat public SDK keys fetched.');
    return { iosKey, androidKey, entitlementId: 'pro', projectId };
  } catch (err) {
    console.warn(`RevenueCat provisioning error: ${err.message}`);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Feature Pruning & NPM Package Removal
// -----------------------------------------------------------------------------
function pruneFeature(featureKey) {
  const feat = FEATURES[featureKey];
  if (!feat) {
    console.error(`Unknown feature: "${featureKey}". Available: ${Object.keys(FEATURES).join(', ')}`);
    return;
  }

  console.log(`✂️  Pruning feature "${feat.name}"…`);

  // 1. Delete associated files/directories
  for (const rel of feat.files) {
    const target = path.join(ROOT, rel);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`   Removed: ${rel}`);
    }
  }

  // 2. Unlink tab if present
  if (feat.tabName) {
    unlinkTab(feat.tabName);
  }

  // 3. Uninstall associated NPM packages if present in package.json
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const toUninstall = feat.packages.filter(
    (p) => (pkg.dependencies && pkg.dependencies[p]) || (pkg.devDependencies && pkg.devDependencies[p]),
  );

  if (toUninstall.length > 0) {
    console.log(`📦 Unwiring npm packages: ${toUninstall.join(', ')}…`);
    try {
      execSync(`npm uninstall ${toUninstall.join(' ')} --silent`, { cwd: ROOT, stdio: 'inherit' });
      console.log(`✅ Uninstalled: ${toUninstall.join(', ')}`);
    } catch (err) {
      console.warn(`Failed to uninstall packages automatically: ${err.message}`);
    }
  }
}

function unlinkTab(tabName) {
  // Update app/(tabs)/_layout.tsx
  const layoutPath = path.join(ROOT, 'app', '(tabs)', '_layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layout = fs.readFileSync(layoutPath, 'utf8');
    const regex = new RegExp(`\\s*<Tabs\\.Screen name="${tabName}"[^>]*\\/>`, 'g');
    layout = layout.replace(regex, '');
    fs.writeFileSync(layoutPath, layout);
  }

  // Update components/glass-tab-bar.tsx
  const barPath = path.join(ROOT, 'components', 'glass-tab-bar.tsx');
  if (fs.existsSync(barPath)) {
    let bar = fs.readFileSync(barPath, 'utf8');
    const iconRegex = new RegExp(`\\s*${tabName}:\\s*\\w+,?`, 'g');
    bar = bar.replace(iconRegex, '');
    fs.writeFileSync(barPath, bar);
  }
}

// -----------------------------------------------------------------------------
// Parse CLI arguments
// -----------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const flags = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }

  return { command, flags };
}

// -----------------------------------------------------------------------------
// CLI Actions
// -----------------------------------------------------------------------------
async function run() {
  const { command, flags } = parseArgs();
  const masterKeys = loadMasterKeys();

  switch (command) {
    case 'status': {
      console.log('--- Universal Swarm: Master Keys Status ---');
      console.log(`Expo mainKey:       ${masterKeys.expo ? 'detected' : 'missing'}`);
      console.log(`RevenueCat mainKey: ${masterKeys.revenuecat ? 'detected' : 'missing'}`);
      console.log('Supabase:           MCP only, not stored in this CLI');
      break;
    }

    case 'list-features': {
      console.log('Available modular features:');
      for (const [key, feat] of Object.entries(FEATURES)) {
        console.log(`- ${key}: ${feat.name}`);
        console.log(`  Packages: ${feat.packages.join(', ') || 'none'}`);
        console.log(`  Files:    ${feat.files.join(', ') || 'none'}`);
      }
      break;
    }

    case 'prune': {
      const feature = flags.feature;
      if (!feature) {
        console.error('Specify a feature to prune with --feature <name>');
        process.exit(1);
      }
      pruneFeature(feature);
      break;
    }

    case 'pages': {
      execSync(`node ${path.join(ROOT, 'scripts', 'publish-pages.mjs')}${flags.deploy ? ' --deploy' : ''}`, {
        cwd: ROOT,
        stdio: 'inherit',
      });
      break;
    }

    case 'link': {
      const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'brand.json'), 'utf8'));
      const easProjectId = await provisionExpoProject(brand.appName, brand.slug, masterKeys.expo);
      const rcKeys = await provisionRevenueCat(brand.appName, brand.bundleId, masterKeys.revenuecat);
      const envPath = path.join(ROOT, '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (easProjectId) envContent = upsertEnv(envContent, 'EAS_PROJECT_ID', easProjectId);
      if (rcKeys) {
        envContent = upsertEnv(envContent, 'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY', rcKeys.iosKey);
        envContent = upsertEnv(envContent, 'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY', rcKeys.androidKey);
        envContent = upsertEnv(envContent, 'EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID', rcKeys.entitlementId);
      }
      fs.writeFileSync(envPath, envContent);
      console.log(easProjectId || rcKeys ? 'Public project values written to .env' : 'Nothing written. Cloud provisioning failed.');
      break;
    }

    case 'init':
    case 'create': {
      const name = flags.name || 'Universal App';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app';
      const bundleId = flags['bundle-id'] || `com.app.${slug.replace(/-/g, '')}`;
      const scheme = flags.scheme || slug.replace(/-/g, '');

      console.log(`\n🪐 Initializing Swarm App: "${name}" (${bundleId})`);

      // 1. Auto-provision Expo
      let easProjectId = null;
      if (masterKeys.expo) {
        easProjectId = await provisionExpoProject(name, slug, masterKeys.expo);
      }

      // 2. Auto-provision RevenueCat
      let rcKeys = null;
      if (masterKeys.revenuecat) {
        rcKeys = await provisionRevenueCat(name, bundleId, masterKeys.revenuecat);
      }

      // 3. Rebrand local files
      const brandPath = path.join(ROOT, 'config', 'brand.json');
      const currentBrand = JSON.parse(fs.readFileSync(brandPath, 'utf8'));
      const newBrand = {
        ...currentBrand,
        appName: name,
        slug,
        bundleId,
        scheme,
      };
      if (rcKeys) {
        newBrand.revenueCatIosKey = rcKeys.iosKey;
        newBrand.revenueCatAndroidKey = rcKeys.androidKey;
      }
      fs.writeFileSync(brandPath, JSON.stringify(newBrand, null, 2) + '\n');

      // 4. Update .env. Project id stays in EAS_PROJECT_ID; app.config.ts reads that.
      const envPath = path.join(ROOT, '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

      if (easProjectId) envContent = upsertEnv(envContent, 'EAS_PROJECT_ID', easProjectId);
      if (rcKeys) {
        envContent = upsertEnv(envContent, 'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY', rcKeys.iosKey);
        envContent = upsertEnv(envContent, 'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY', rcKeys.androidKey);
        envContent = upsertEnv(envContent, 'EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID', rcKeys.entitlementId);
      }
      envContent = upsertEnv(envContent, 'EXPO_PUBLIC_APP_SCHEME', scheme);

      // If user passed Supabase URL / Anon key
      if (flags['supabase-url']) {
        envContent = envContent.replace(/EXPO_PUBLIC_SUPABASE_URL=.*/, `EXPO_PUBLIC_SUPABASE_URL=${flags['supabase-url']}`);
      }
      if (flags['supabase-anon-key']) {
        envContent = envContent.replace(/EXPO_PUBLIC_SUPABASE_ANON_KEY=.*/, `EXPO_PUBLIC_SUPABASE_ANON_KEY=${flags['supabase-anon-key']}`);
      }

      // When real keys are generated, turn off UI preview mode
      if (rcKeys && flags['supabase-url']) {
        envContent = envContent.replace(/EXPO_PUBLIC_UI_PREVIEW=1/, 'EXPO_PUBLIC_UI_PREVIEW=0');
      }

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Configuration written to .env and config/brand.json');

      // 5. Prune excluded features
      if (flags.exclude) {
        const toExclude = flags.exclude.split(',').map((f) => f.trim());
        for (const f of toExclude) {
          pruneFeature(f);
        }
      }

      console.log(`\n🎉 Swarm initialization complete for "${name}"!\n`);
      break;
    }

    default: {
      console.log(`
Universal Command Swarm CLI
Usage:
  node scripts/swarm.mjs <command> [options]

Commands:
  status                                     Check status of master account keys
  list-features                              List modular components & dependent npm packages
  prune --feature <name>                     Remove feature & uninstall unused npm packages
  pages [--deploy]                           Write privacy, terms, and support pages; deploy them with Vercel when asked
  init --name <AppName> [--exclude <feats>]  Full auto-provisioning from master keys
      `);
      break;
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
