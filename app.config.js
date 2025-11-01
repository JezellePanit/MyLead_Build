import "dotenv/config";

export default ({ config }) => ({
  ...config,
  name: "MyLead",
  slug: "myleadapplication",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mylead",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  updates: {
    url: "https://u.expo.dev/58a2603c-8e40-4346-aa28-079aa77008fa",
  },

  runtimeVersion: {
    policy: "appVersion",
  },

  ios: {
    bundleIdentifier: "com.mylead.app",
    supportsTablet: true,
    buildNumber: "1.0.0",
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: "com.mylead",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET",
    ],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
      },
    },
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    eas: {
      projectId: "83a4a2c7-4d2e-4ad8-8aed-dad0b6954494",
    },
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    expoPublicGoogleMapsApiKey:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    releaseChannel: process.env.EAS_BUILD_PROFILE || "development",
  },
});
