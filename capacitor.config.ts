import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.masoud.library',
  appName: 'Hanoutak',
  webDir: 'out',
  server: {
    url: 'https://h-masoud.vercel.app/login?app=mobile&acc=HANOUTAK-APP',
    cleartext: true
  }
};

export default config;