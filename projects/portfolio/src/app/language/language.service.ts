import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

// ---------------------------------------------------------------------------
// Languages the site is available in.
// To add one: add an entry here, add its text to every entry in
// public/translations.json (e.g. "fr": "…"), and add its flag to the
// "flags" asset list in angular.json.
// ---------------------------------------------------------------------------

export interface Language {
  code: string;
  /** The language's own name, so people can find it, e.g. "עברית". */
  name: string;
  dir: 'ltr' | 'rtl';
  /** File in the site's flags/ folder (copied from the flag-icons package). */
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr', flag: 'flags/us.svg' },
  { code: 'he', name: 'עברית', dir: 'rtl', flag: 'flags/il.svg' },
];

export const DEFAULT_LANGUAGE = 'en';

const STORAGE_KEY = 'language';

/**
 * The site's current language.
 *
 * - `t('key')` returns a text and re-runs automatically when the language changes,
 *   so it can be used in templates and inside `computed()`.
 * - `use('he')` loads that language first, then switches, so text never flashes as raw keys.
 * - Keeps <html lang dir> in sync and remembers the visitor's choice.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  readonly languages = LANGUAGES;

  private readonly code = signal(DEFAULT_LANGUAGE);
  readonly lang = this.code.asReadonly();
  readonly current = computed(() => this.find(this.code()) ?? LANGUAGES[0]);

  /** Runs once before the app first renders (see app.config.ts). */
  init(): Promise<void> {
    return this.use(this.initialLanguage(), { remember: false });
  }

  async use(code: string, { remember = true } = {}): Promise<void> {
    const language = this.find(code);
    if (!language) return;

    await firstValueFrom(this.transloco.load(language.code));
    this.transloco.setActiveLang(language.code);
    this.code.set(language.code);

    const html = this.document.documentElement;
    html.lang = language.code;
    html.dir = language.dir;

    if (remember) this.save(language.code);
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(key, params, this.code());
  }

  private find(code: string): Language | undefined {
    return LANGUAGES.find((l) => l.code === code);
  }

  /** Saved choice → browser language → default. */
  private initialLanguage(): string {
    const saved = this.read();
    if (saved && this.find(saved)) return saved;
    const browser = this.document.defaultView?.navigator.language?.slice(0, 2);
    return browser && this.find(browser) ? browser : DEFAULT_LANGUAGE;
  }

  private read(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null; // storage blocked (private mode, etc.)
    }
  }

  private save(code: string): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // storage blocked: the choice just won't be remembered
    }
  }
}

/**
 * Browser tab titles. Route titles are text keys (e.g. 'titles.work');
 * this translates them and updates the tab when the language changes.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedPageTitle extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly language = inject(LanguageService);
  private readonly key = signal<string | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const key = this.key();
      if (key) this.title.setTitle(this.language.t(key));
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key.set(this.buildTitle(snapshot));
  }
}
