import "dotenv/config";

export default ({ config }) => ({
  ...config,
  owner: "jezellelois",
  name: "MyLead",
  slug: "myleadapplication",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/LittleLogo.png",
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
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: "com.mylead",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/LittleLogo.png",
      backgroundColor: "#ffffff",
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET",
    ],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
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

    // ✅ public Google Maps API Key for web + client-side
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,

    // EAS build channel
    releaseChannel: process.env.EAS_BUILD_PROFILE || "development",
  },
});
