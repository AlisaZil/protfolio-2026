import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { provideTestTranslations } from '../../testing/translations';
import { LanguageService } from '../language/language.service';
import { SlideIn } from './slide-in';

@Component({
  imports: [SlideIn],
  template: `<section [appSlideIn]="{ from: 'right', onScroll: false }">Hello</section>`,
})
class Host {}

describe('SlideIn', () => {
  beforeEach(() => {
    // The test browser has no matchMedia; pretend motion is allowed.
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    delete (window as Partial<Window>).matchMedia;
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
    localStorage.removeItem('language');
  });

  it('plays on load and again after a language switch', async () => {
    TestBed.configureTestingModule({ providers: [provideTestTranslations()] });
    const from = vi.spyOn(gsap, 'from');
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(from).toHaveBeenCalledTimes(1);
    expect(from.mock.calls[0][1]).toMatchObject({ x: 32, opacity: 0 });

    await TestBed.inject(LanguageService).use('he');
    await fixture.whenStable();

    expect(from).toHaveBeenCalledTimes(2);
    // Right-to-left: "from the right" mirrors to come from the left.
    expect(from.mock.calls[1][1]).toMatchObject({ x: -32, opacity: 0 });
  });
});
