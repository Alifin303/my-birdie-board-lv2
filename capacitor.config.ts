import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.27a89ed1d87344e6b08d3d5b405d80f4',
  appName: 'my-birdie-board-lv2',
  webDir: 'dist',
  server: {
    url: 'https://27a89ed1-d873-44e6-b08d-3d5b405d80f4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;