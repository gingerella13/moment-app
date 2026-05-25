import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.moment.app",
  appName: "Moment",
  webDir: "dist/public",
  bundledWebRuntime: false,
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
