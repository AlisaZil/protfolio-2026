import { importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import translations from '../../public/translations.json';
import { TranslationsFile, pickLanguage } from '../app/language/translations-loader';

const file = translations as TranslationsFile;

/** Real translations for tests, loaded instantly (no HTTP). */
export function provideTestTranslations() {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en: pickLanguage(file, 'en'), he: pickLanguage(file, 'he') },
      translocoConfig: {
        availableLangs: ['en', 'he'],
        defaultLang: 'en',
        fallbackLang: 'en',
        missingHandler: { useFallbackTranslation: true },
      },
      preloadLangs: true,
    }),
  );
}
