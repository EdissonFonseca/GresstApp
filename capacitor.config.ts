import type { CapacitorConfig } from '@capacitor/cli';
import { environment } from './src/environments/environment';

const capacitorConfig: CapacitorConfig = {
  appId: 'com.gresst.app',
  appName: 'Gresst App',
  webDir: 'www',
  plugins: {
    GoogleMaps: {
      apiKey: environment.GOOGLE_MAPS_API_KEY
    }
  }
};

export default capacitorConfig;
