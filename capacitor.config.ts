import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9be9f92b27ee433dbbc5c6c1d46011d1',
  appName: 'gldhourai',
  webDir: 'dist',
  server: {
    url: 'https://9be9f92b-27ee-433d-bbc5-c6c1d46011d1.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
