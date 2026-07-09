import * as Sentry from '@sentry/electron/main';
import { app } from 'electron';
import { SENTRY_DSN } from './constants.js';

const APP_VERSION = app.getVersion();

export function initSentry() {
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    release: APP_VERSION,
    environment: app.isPackaged ? 'production' : 'development',
    enabled: true,
    tracesSampleRate: 0.1,
    attachStacktrace: true,
    sendDefaultPii: false,
  });

  Sentry.setTag('platform', process.platform);
  Sentry.setTag('appVersion', APP_VERSION);
  Sentry.setTag('environment', app.isPackaged ? 'production' : 'development');
}

export function captureException(error, extra = {}) {
  if (!SENTRY_DSN) {
    return;
  }
  Sentry.captureException(error, {
    extra,
  });
}

export function captureMessage(message, level = 'info', extra = {}) {
  if (!SENTRY_DSN) {
    return;
  }
  Sentry.captureMessage(message, {
    level,
    extra,
  });
}

export function setUserContext(user) {
  if (!SENTRY_DSN) {
    return;
  }
  Sentry.setUser(user);
}

export function addBreadcrumb(breadcrumb) {
  if (!SENTRY_DSN) {
    return;
  }
  Sentry.addBreadcrumb(breadcrumb);
}