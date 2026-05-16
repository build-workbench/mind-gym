import DefaultTheme from 'vitepress/theme';
import cleanupModule from './service-worker-cleanup.cjs';
import './style.css';

const { cleanupLegacyRootServiceWorkers } = cleanupModule;

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx);

    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    void cleanupLegacyRootServiceWorkers(import.meta.env.BASE_URL);
  },
};
