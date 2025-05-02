import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gresst.app',
  appName: 'Gresst App',
  webDir: 'www',
  plugins: {
    GoogleMaps: {
      apiKey: ''
    }
  }
};

export default config;
