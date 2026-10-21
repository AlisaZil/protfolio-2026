import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, map, shareReplay } from 'rxjs';

/**
 * Shape of public/translations.json: every text is an object with one entry
 * per language, e.g. { "en": "Home", "he": "בית" }, grouped by page.
 */
export interface TranslationsFile {
  [key: string]: TranslationsFile | Record<string, string>;
}

/** Loads public/translations.json (once) and hands Transloco one language from it. */
@Injectable({ providedIn: 'root' })
export class TranslationsLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly file$ = this.http
    .get<TranslationsFile>('translations.json')
    .pipe(shareReplay(1));

  getTranslation(lang: string): Observable<Translation> {
    return this.file$.pipe(map((file) => pickLanguage(file, lang)));
  }
}

/**
 * Pulls one language out of the file, e.g. { nav: { home: "בית" } } for 'he'.
 * Missing or empty texts become '', which shows the English version instead.
 */
export function pickLanguage(file: TranslationsFile, lang: string): Translation {
  const result: Translation = {};
  for (const [key, node] of Object.entries(file)) {
    result[key] = isText(node) ? (node[lang] ?? '') : pickLanguage(node, lang);
  }
  return result;
}

/** A text entry is an object whose values are all strings ({ en, he }). */
function isText(node: TranslationsFile | Record<string, string>): node is Record<string, string> {
  return Object.values(node).every((value) => typeof value === 'string');
}
