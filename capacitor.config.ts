import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'GresstApp',
  webDir: 'www',
  plugins: {
    GoogleMaps: {
      apiKey: 'AIzaSyA8SEXEl9A8VwxBGwECmlHU-N8X8uR6SNA'
    }
  }
};

export default config;
