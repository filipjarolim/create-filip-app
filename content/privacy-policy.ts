export const privacyPolicyMarkdown = `
# Privacy Policy

This is a starter policy for Create Filip App. Replace it with counsel-reviewed text before you submit the app.

## Data we collect

- Account email and user id, stored in Supabase so you can sign in.
- Purchase status, processed by Apple, Google, and RevenueCat so the app can tell whether Premium is active.
- Permission choices you make for notifications, camera, photos, and, on iOS, tracking.

## How it is used

Account data is used to provide the app. Purchase data is used to unlock Premium. The template does not sell personal information.

## Tracking

The shipped template declares NSPrivacyTracking as false. Do not call the tracking prompt until you add an attribution or advertising SDK, and update PrivacyInfo.xcprivacy when you do.

## Deletion

You can delete the account from Profile. That calls the delete-account Supabase Edge Function, which removes the authenticated user. Add a foreign key with ON DELETE CASCADE for any profile tables you create.

## Contact

Replace this section with the support address you want listed on the store page.
`.trim();
