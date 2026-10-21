import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { hideSplash } from './app/shared/splash';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err))
  .finally(hideSplash);
