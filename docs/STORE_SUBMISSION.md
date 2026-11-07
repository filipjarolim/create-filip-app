# Store submission

Use this checklist for Create Filip App. Replace the product name, domain, and data answers if you collect anything the template does not.

The in-app Privacy Policy and Terms are templates. Have them reviewed, host public URLs, and paste those URLs into App Store Connect and Play Console.

## Apple

- Privacy manifest: `app.config.ts` writes `PrivacyInfo.xcprivacy` during prebuild. Tracking is declared off. Email, user id, purchase history, and product interaction are declared as collected and not used for tracking.
- Usage strings: camera, photo library, and user tracking are set. The template does not request the microphone and turns Android `RECORD_AUDIO` off.
- Account deletion: Profile → Delete account. Two confirmations, then the `delete-account` Edge Function. This is the control for guideline 5.1.1.
- Tracking: the ATT explainer is on Profile. Leave it unused until an advertising or attribution SDK is integrated. If you enable tracking, set `NSPrivacyTracking` to true, list tracking domains, update App Privacy, and remove `com.google.android.gms.permission.AD_ID` from `android.blockedPermissions`. The template blocks that permission so Play does not treat the app as using the advertising ID.
- Export compliance: `ITSAppUsesNonExemptEncryption` is false because the app only uses HTTPS. Answer the encryption question to match that, unless you add your own cryptography.
- Sign in with Apple: add it before release if you add Google, Facebook, or another third-party login.
- Universal links: replace `your-domain.com` and serve `https://your-domain.com/.well-known/apple-app-site-association`.
- Review notes: tell the reviewer where account deletion lives and that subscriptions are managed by the store.
- Age rating and screenshots: complete these in App Store Connect. The template does not generate screenshots.

## Google Play Data safety

Answer the form from what this template actually does.

| Data | Collected | Shared | Purpose | Optional |
| --- | --- | --- | --- | --- |
| Email address | Yes | Supabase, as the account processor | Account management | No |
| User IDs | Yes | Supabase and RevenueCat | Account management and purchases | No |
| Purchase history | Yes | Apple or Google, and RevenueCat | App functionality | No |
| Photos or camera | Only if the user allows the permission | No | App functionality | Yes |
| Device or other IDs for tracking | No, until you enable a tracker | No | Not declared | — |

Also mark:

- Data is encrypted in transit.
- Users can request deletion. Point at the in-app Profile → Delete account flow, and keep a web deletion method if Play asks for one.
- The privacy policy URL is public.

Play Console still needs the content rating questionnaire, a feature graphic, screenshots, and the ads declaration. The template does not show ads. Say so unless you add them.

## Subscriptions

- Create the same product identifiers in App Store Connect and Play Console, then map them in RevenueCat.
- The paywall uses the current offering and labels weekly, monthly, and annual packages.
- Restore purchases is on the Premium tab and on Profile.
- Preview builds submit to TestFlight and the Play internal testing track.
- Production builds submit to the production Play track. iOS submission still lands in TestFlight before you release it in App Store Connect.

## Release tag

Pushing `v1.2.0` runs the release workflow. It needs `EXPO_TOKEN`. Add `GOOGLE_SERVICE_ACCOUNT_KEY` when the Play key is not already stored in EAS. `eas.json` sets `autoIncrement`, so EAS raises the iOS build number and Android version code. Set `EXPO_PUBLIC_APP_ENV=production` in the production EAS environment so a placeholder key fails the build.

## Age rating for 2026

Answer the questionnaire for an app that has accounts, user-generated reports, and an AI assistant:

- Accounts and user-generated content: yes. The app requires an unchecked EULA checkbox, a report form, and a block action.
- AI or chat: yes. Intimate and harmful prompts are rejected on the device and again in the `ai-complete` Edge Function.
- Unrestricted web access, gambling, and advertising: no, unless you add them.
- Made for kids: no.

Do not put the words Free, Cheap, or a price in screenshots, the subtitle, or `store/listing.json`. `npm run metadata` checks that file.
