import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LanguageService,
  TranslatedPageTitle,
} from './language/language.service';
import { TranslationsLoader } from './language/translations-loader';
import { preloadAssets } from './shared/preload';
import { setSplashProgress } from './shared/splash';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: LANGUAGES.map((l) => l.code),
        defaultLang: DEFAULT_LANGUAGE,
        fallbackLang: DEFAULT_LANGUAGE,
        missingHandler: { useFallbackTranslation: true },
        prodMode: !isDevMode(),
      },
      loader: TranslationsLoader,
    }),
    // Before the first render: load the language (so text never flashes) and every photo,
    // flag and sound (so they're ready instantly), while the loading screen shows progress.
    provideAppInitializer(() =>
      Promise.all([inject(LanguageService).init(), preloadAssets(setSplashProgress)]),
    ),
    { provide: TitleStrategy, useClass: TranslatedPageTitle },
  ],
};
