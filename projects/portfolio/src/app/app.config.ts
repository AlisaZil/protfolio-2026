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
    // Load the visitor's language before the first render, so text never flashes.
    provideAppInitializer(() => inject(LanguageService).init()),
    { provide: TitleStrategy, useClass: TranslatedPageTitle },
  ],
};
