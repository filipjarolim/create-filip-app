# Universal Command Swarm Protocol (`SWARM.md`)

This document outlines the **Command Swarm** architecture for cloning, rebranding, provisioning, and pruning apps branched from `create-filip-app`.

---

## 1. Master Account Keys (`mainKey`)

Instead of manually generating and pasting 6+ environment variables for every branched app, the starter operates on **master account tokens**:

| Service | Master Key Name | What It Does | Where It Lives |
| :--- | :--- | :--- | :--- |
| **Expo / EAS** | `mainKey` (`EXPO_MAIN_KEY` / `EXPO_TOKEN`) | Creates the EAS project through GraphQL and writes `EAS_PROJECT_ID` into `.env` | `~/.config/expo-universal/keys.json` |
| **RevenueCat** | `mainKey` (`REVENUECAT_MAIN_KEY`, v2 `sk_`) | Creates the project, iOS and Android apps, the `pro` entitlement, and writes the public SDK keys into `.env` | `~/.config/expo-universal/keys.json` |
| **Supabase** | MCP | The agent creates the project through the Supabase MCP. The swarm does not store a service key. | MCP session |

### Supplying Master Keys
Account tokens stay outside the repo, mode `600`:

`~/.config/expo-universal/keys.json`

```json
{
  "expo": { "mainKey": "your_expo_token_here" },
  "revenuecat": { "mainKey": "sk_your_revenuecat_v2_secret_key_here" }
}
```

`.env` only receives public values: `EAS_PROJECT_ID`, `EXPO_PUBLIC_*`. Do not put `mainKey` there. A shell export of `EXPO_MAIN_KEY` or `REVENUECAT_MAIN_KEY` still overrides the file.

---

## 2. Command Swarm CLI

The swarm engine is managed via `node scripts/swarm.mjs` (or `npm run swarm`).

### Command Reference

| Command | Description |
| :--- | :--- |
| `npm run swarm:status` | Validates whether your Expo, RevenueCat, and Supabase tokens are detected and ready. |
| `npm run feature:list` | Lists all modular features, their corresponding files, and npm packages. |
| `npm run swarm:init -- --name "AppName"` | Full end-to-end auto-provisioning: rebrands, creates Expo & RevenueCat projects, and writes `.env`. |
| `npm run feature:prune -- --feature <name>` | Unwires a feature and uninstalls its unused npm dependencies from `package.json`. |

---

## 3. Modular Features & NPM Package Unwiring

When branching off a new app from this template, you can prune features that your new app does not need. The swarm script will **automatically remove the route/tab files and uninstall the unused npm packages** so your dependency tree stays lean.

| Feature Key | Included NPM Packages | Removed Artifacts |
| :--- | :--- | :--- |
| `paywall` | `react-native-purchases` | Paywall tab, subscription hooks, order configs |
| `ai` | `expo-sqlite` | AI tab, model runner, local runtime |
| `premade` | `expo-image-manipulator` | Components tab, map, weather, FX, compressor |
| `camera` | `expo-camera` | Camera permissions & hooks |
| `notifications` | `expo-notifications` | Push notification listeners & background tasks |

### Example: Pruning an unused feature
```bash
# If your new app has no paywall / in-app subscriptions:
npm run feature:prune -- --feature paywall

# If your new app does not need AI:
npm run feature:prune -- --feature ai
```

---

## 4. Agent Autonomous Initialization Recipe

When an AI agent is instructed to create a new app from this template, the agent executes these steps:

### Step 1: Check Status
```bash
node scripts/swarm.mjs status
```

### Step 2: Auto-Provision Expo & RevenueCat
```bash
node scripts/swarm.mjs init --name "FitPulse" --bundle-id "com.brand.fitpulse" --exclude "ai"
```
*(This creates the Expo cloud project, creates the RevenueCat project + apps + pro entitlement, writes the public keys into `.env`, and uninstalls `expo-sqlite`)*.

### Step 3: Provision Supabase
Create the project with the Supabase MCP in the user's only organization, region `eu-central-1`, after repeating a nonzero cost and getting agreement. A quoted cost of 0 can be confirmed and created. Then apply every file in `supabase/migrations/` in order, write `EXPO_PUBLIC_SUPABASE_URL` and the publishable key into `.env`, and set `EXPO_PUBLIC_UI_PREVIEW=0`. Signup confirms the email in the database and then signs in, so the login screen works without a separate confirmation click.

### Step 4: Verify Compilation
```bash
npm run typecheck && npm test
```

---

## 5. NPM Component Exports

All UI primitives and pre-built components are exported as modular, package-like imports:

- **UI Primitives**:
  ```ts
  import { Button, Card, GlassCard, Input, Text, Skeleton, Switch } from '@/components/ui';
  ```
- **Premade API Components**:
  ```ts
  import { MapViewer, PhotoCompressor, WeatherWidget, CurrencyConverter, PublicImagePicker } from '@/components/premade';
  ```
