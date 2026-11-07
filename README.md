# Create Filip App

Production starter for a commercial iOS and Android app. It is an Expo SDK 58 project with the React Native New Architecture enabled by default, file-based routing, Tailwind CSS v4, Supabase auth, RevenueCat subscriptions, and EAS release automation.

Expo Go for SDK 58 may not be in the stores yet. Use a development build.

## Stack

- Expo SDK 58, React Native 0.88, React 19, TypeScript strict
- Expo Router with protected auth routes
- NativeWind 5.0.0-rc.1 and Tailwind CSS 4.3.3
- React Native Reusables-style primitives in `components/ui` (`Button`, `Card`, `Input`, `GlassCard`)
- TanStack Query persisted with AsyncStorage, plus Zustand
- Supabase auth stored in chunked `expo-secure-store`
- RevenueCat subscriptions
- EAS Build / Submit and GitHub Actions

NativeWind’s stable 4.x line still uses Tailwind CSS 3. Tailwind CSS v4 ships through NativeWind 5, which is a release candidate. This repo pins `nativewind@5.0.0-rc.1` and `react-native-css@3.1.0-rc.1` together. Upgrade those two as a pair.

## Prerequisites

- Node.js 22
- Xcode 27 for iOS device and simulator builds
- Android Studio for Android builds
- An Expo account and the EAS CLI (`npm install --global eas-cli`)
- A Supabase project and a RevenueCat project

## 1. Install

```bash
npm install
cp .env.example .env
```

Fill in `.env`. Restart Metro after every change to `EXPO_PUBLIC_` values. The service-role key does not belong in the app.

To click through the interface before Supabase and RevenueCat exist, set `EXPO_PUBLIC_UI_PREVIEW=1`. The app signs in as `preview@example.com` and skips purchases. Leave that flag unset for any store build.

## 2. Rebrand

```bash
npm run rebrand
```

`npm run rename` is the same command. The script asks for the app name, bundle id, URL scheme, Supabase URL, and RevenueCat keys. It rewrites `app.config.ts`, `package.json`, `.env.example`, the legal copy, `store/listing.json`, and `config/brand.json`. Run it again later and it starts from the values in `config/brand.json`.

For a non-interactive run, set `BRAND_APP_NAME`, `BRAND_BUNDLE_ID`, `BRAND_SCHEME`, `BRAND_SUPABASE_URL`, `BRAND_REVENUECAT_IOS_KEY`, and `BRAND_REVENUECAT_ANDROID_KEY`.

Then replace `your-domain.com` in `app.config.ts` with the host that will serve your Apple App Site Association file and Android `assetlinks.json`.

## 3. Run a development build

```bash
npx expo run:ios
npx expo run:android
```

Those commands compile a development client, which is required for RevenueCat and the other native modules. After the client is installed:

```bash
npm start
```

A cloud development client:

```bash
eas login
eas init
npm run build:development
```

`eas init` writes the EAS project id. You can also set `EAS_PROJECT_ID` in the environment.

## 4. Supabase

1. Create a project and enable email auth.
2. Put the project URL and anon key in `.env` and in the EAS environments `development`, `preview`, and `production`.
3. If you add a `profiles` table, reference `auth.users(id)` with `ON DELETE CASCADE`.
4. Deploy account deletion:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy delete-account
```

Profile → Delete account asks for confirmation twice, then calls this function with the user access token. The function checks that token and calls `auth.admin.deleteUser` with the service-role key. The service-role key never ships in the binary.

## 5. RevenueCat

1. Create an entitlement named `pro`, or change `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`.
2. Add monthly and annual packages to the current offering.
3. Put the Apple and Google public SDK keys in `.env` and in the matching EAS environments.
4. The Premium tab lists weekly, monthly, and annual packages, shows a trial badge when the product has a zero-price intro, and restores purchases. Set `EXPO_PUBLIC_PAYWALL_VARIANT` to `control` to lead with the weekly package.

## 6. Store builds

Create the apps in App Store Connect and Google Play. Upload an App Store Connect API key and the Google service account key with `eas credentials`, or keep `google-service-account.json` locally and out of git.

```bash
npm run build:preview
npm run submit:preview
npm run build:production
npm run submit:production
```

Preview submits an iOS build to TestFlight and an Android App Bundle to the Play internal testing track. Internal testers in App Store Connect can install the TestFlight build. Play internal app sharing is a separate upload path; the internal testing track is what `eas submit` drives.

Replace `YOUR_APPLE_ID`, `YOUR_ASC_APP_ID`, and `YOUR_APPLE_TEAM_ID` in `eas.json`.

Store questionnaire answers, the privacy manifest, and the account-deletion path are listed in [docs/STORE_SUBMISSION.md](docs/STORE_SUBMISSION.md).

## 7. GitHub releases

Repository secrets:

- `EXPO_TOKEN` from `eas token:create`
- `GOOGLE_SERVICE_ACCOUNT_KEY` with the raw JSON, if you have not stored that key in EAS

Pushing a tag such as `v1.2.0` runs `.github/workflows/release.yml`, which builds both platforms with the production profile and submits them. EAS increments the build number. Pull requests run `.github/workflows/test.yml`: lint, typecheck, unit tests, a secret scan, and the store-listing check.

Set these production EAS environment values in addition to the keys in `.env.example`:

- `EXPO_PUBLIC_APP_ENV=production`, so `scripts/check-env.js` rejects placeholder keys
- `EXPO_PUBLIC_UPDATES_URL`, after `eas update:configure`, if you want OTA hotfixes on the `production` channel
- `AI_PROVIDER_URL`, `AI_PROVIDER_KEY`, and optionally `AI_PROVIDER_MODEL` as secrets on the `ai-complete` function, not in the app

Deploy `delete-account`, `report-content`, and `ai-complete`. Apply `supabase/migrations/20261102120000_moderation.sql` before the first report.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

## Platform notes

- iOS cards and the tab bar use Liquid Glass when the system provides it, and `BlurView` with `systemUltraThinMaterialDark` or `systemUltraThinMaterialLight` otherwise. Android uses a tinted surface and a hairline border. The Android tab bar follows a Material 3 layout: full-width surface and a pill indicator.
- Android draws edge to edge. The status bar is translucent and the navigation bar contrast scrim is off, so content can run under both bars. Safe areas come from `react-native-safe-area-context`.
- The template does not lock the display to 60Hz. Reanimated animations run on the UI thread.
- Tracking permission is available from Profile and is explained before the system prompt. Do not request it until the app actually tracks, then set `NSPrivacyTracking` to true.
- The third positive moment, from the dashboard action or a completed purchase, can ask for an in-app review through `expo-store-review`. The operating system decides whether the prompt appears.
- Tokens stay in `expo-secure-store`. Sign-out clears that store, the query cache, and the local preference stores. AsyncStorage is limited to the query cache and UI preferences.
- Certificate pinning is the Android network-security config from `plugins/withTlsPins.js`, and it is applied only when `EXPO_PUBLIC_TLS_PINS` is set. Every platform also refuses non-https calls and hosts outside the Supabase allowlist. iOS does not get a public-key pin from this plugin.
- Jailbreak and root detection uses `Device.isRootedExperimentalAsync`. A positive result blocks purchases. Biometric lock and the app-switcher blur are off and on, respectively, until the user changes them in Profile.
- The assistant calls `ai-complete` on Supabase. A local GGUF runtime is a registration point in `lib/ai/local-runtime.ts`; this repo does not bundle model weights or ExecuTorch.
- `npm run assets` rebuilds the icon set from `assets/images/mark.svg`. `npm run analyze` prints the largest installed packages.
