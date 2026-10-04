import type { ExpoConfig } from "expo/config";

const iosGoogleClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const iosUrlScheme = iosGoogleClientId
  ? `com.googleusercontent.apps.${iosGoogleClientId.replace(/\.apps\.googleusercontent\.com$/, "")}`
  : undefined;

const config: ExpoConfig = {
  name: "IXZZY",
  slug: "ixzzy",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  scheme: "ixzzy",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ixzzy.store",
  },
  android: {
    package: "com.ixzzy.store",
    adaptiveIcon: {
      backgroundColor: "#f0d91e",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    ...(iosUrlScheme
      ? [["@react-native-google-signin/google-signin", { iosUrlScheme }] as [string, { iosUrlScheme: string }]]
      : []),
  ],
  experiments: { typedRoutes: true },
};

export default config;
