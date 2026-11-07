import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_NAME = 'Create Filip App';
const SLUG = 'create-filip-app';
const SCHEME = 'createfilipapp';
const BUNDLE_ID = 'com.filip.createfilipapp';

// Replace your-domain.com with the site that serves Apple App Site Association
// and the Android assetlinks.json file before you ship universal links.
const UNIVERSAL_LINK_HOST = 'your-domain.com';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: SLUG,
  scheme: SCHEME,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  // SDK 58 turns the React Native New Architecture on for every app.
  // The frame rate is not capped, so 90Hz and 120Hz devices keep their refresh rate.
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
    associatedDomains: [`applinks:${UNIVERSAL_LINK_HOST}`],
    icon: {
      light: './assets/images/icon.png',
      dark: './assets/images/icon-dark.png',
      tinted: './assets/images/icon-tinted.png',
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSFaceIDUsageDescription: 'Create Filip App uses Face ID to unlock the app after it has been in the background.',
      NSUserTrackingUsageDescription:
        'Create Filip App uses this identifier only after you allow tracking, to measure campaigns. You can change this later in Settings.',
      NSCameraUsageDescription: 'Create Filip App uses the camera only when you choose to take a photo.',
      NSPhotoLibraryUsageDescription:
        'Create Filip App accesses your photo library only when you choose an image to attach.',
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeEmailAddress',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeUserID',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePurchaseHistory',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeProductInteraction',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAnalytics'],
        },
      ],
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1', '0A2A.1', '3B52.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
          NSPrivacyAccessedAPITypeReasons: ['E174.1', '85F4.1'],
        },
      ],
    },
  },
  android: {
    package: BUNDLE_ID,
    predictiveBackGestureEnabled: false,
    blockedPermissions: ['com.google.android.gms.permission.AD_ID'],
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      backgroundColor: '#4F46E5',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        category: ['BROWSABLE', 'DEFAULT'],
        data: [
          {
            scheme: 'https',
            host: UNIVERSAL_LINK_HOST,
            pathPrefix: '/app',
          },
        ],
      },
    ],
  },
  androidStatusBar: {
    translucent: true,
    backgroundColor: '#00000000',
    barStyle: 'dark-content',
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#4F46E5',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      'expo-status-bar',
      {
        style: 'auto',
      },
    ],
    [
      'expo-navigation-bar',
      {
        // Keeps the Android navigation bar transparent so content can draw edge to edge.
        // The bar stays available for gestures; it is not hidden.
        enforceContrast: false,
        style: 'dark',
      },
    ],
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission:
          'Create Filip App uses this identifier only after you allow tracking, to measure campaigns. You can change this later in Settings.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Create Filip App uses the camera only when you choose to take a photo.',
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Create Filip App accesses your photo library only when you choose an image to attach.',
        microphonePermission: false,
      },
    ],
    [
      'expo-notifications',
      {
        color: '#4F46E5',
      },
    ],
    'expo-image',
    'expo-localization',
    'expo-sqlite',
    'expo-web-browser',
    ...(process.env.EXPO_PUBLIC_TLS_PINS
      ? [
          [
            './plugins/withTlsPins',
            {
              host: (() => {
                try {
                  return new URL(process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://localhost').hostname;
                } catch {
                  return 'localhost';
                }
              })(),
              pins: process.env.EXPO_PUBLIC_TLS_PINS.split(',').map((pin) => pin.trim()).filter(Boolean),
            },
          ] as [string, { host: string; pins: string[] }],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    alternateIcons: ['./assets/images/icon-premium.png'],
  },
  ...(process.env.EXPO_PUBLIC_UPDATES_URL
    ? {
        runtimeVersion: { policy: 'appVersion' as const },
        updates: { url: process.env.EXPO_PUBLIC_UPDATES_URL },
      }
    : {}),
});
