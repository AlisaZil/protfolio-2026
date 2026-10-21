import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { LanguageService } from './language.service';
import { TranslationsFile, pickLanguage } from './translations-loader';

const file: TranslationsFile = {
  nav: {
    home: { en: 'Home', he: 'בית' },
    work: { en: 'Work', he: '' }, // not translated yet
  },
};

describe('pickLanguage', () => {
  it('pulls one language out of the side-by-side file', () => {
    expect(pickLanguage(file, 'he')).toEqual({ nav: { home: 'בית', work: '' } });
    expect(pickLanguage(file, 'en')).toEqual({ nav: { home: 'Home', work: 'Work' } });
  });
});

describe('LanguageService', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
    localStorage.removeItem('language');
  });

  it('starts in English on a first visit, even when the browser is set to Hebrew', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('he-IL');
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(
          TranslocoTestingModule.forRoot({
            langs: { en: pickLanguage(file, 'en'), he: pickLanguage(file, 'he') },
            translocoConfig: { availableLangs: ['en', 'he'], defaultLang: 'en' },
            preloadLangs: true,
          }),
        ),
      ],
    });
    const language = TestBed.inject(LanguageService);
    await language.init();
    expect(language.lang()).toBe('en');
    vi.restoreAllMocks();
  });

  it('shows English for Hebrew texts that are left empty', async () => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(
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
        ),
      ],
    });
    const language = TestBed.inject(LanguageService);
    await language.use('he');

    expect(language.t('nav.home')).toBe('בית');
    expect(language.t('nav.work')).toBe('Work');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
