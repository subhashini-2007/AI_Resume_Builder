import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.subhashini.airesumebuilder',
  appName: 'AI Resume Builder',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://ai-resume-builder-cyan-phi.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#f1fcf5', // Light green background matching splash
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
