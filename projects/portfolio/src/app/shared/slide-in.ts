import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageService } from '../language/language.service';

/** Where the element slides in from. */
export type SlideFrom = 'below' | 'above' | 'left' | 'right';

export interface SlideInConfig {
  /** Default 'below'. */
  from?: SlideFrom;
  /** Start offset in px. Default 32. */
  distance?: number;
  /** Seconds. Default 0.8. */
  duration?: number;
  /** Seconds before starting. Default 0. */
  delay?: number;
  /**
   * Animate the element's children one after another instead of the element itself,
   * with this many seconds between them.
   */
  stagger?: number;
  /** Wait until the element scrolls into view. Default true. */
  onScroll?: boolean;
}

/**
 * Slides an element in (with a fade) using GSAP + ScrollTrigger.
 *
 *   <section appSlideIn>…</section>
 *   <ul [appSlideIn]="{ from: 'left', stagger: 0.1 }">…</ul>
 *
 * Plays when the page loads, and again whenever the language changes, so a
 * language switch looks like a fresh page load. In right-to-left languages,
 * 'left' and 'right' swap so the motion mirrors with the layout.
 * Skipped for people who prefer reduced motion.
 */
@Directive({ selector: '[appSlideIn]' })
export class SlideIn {
  readonly config = input<SlideInConfig | ''>('', { alias: 'appSlideIn' });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly language = inject(LanguageService);
  private media: gsap.MatchMedia | undefined;

  constructor() {
    afterNextRender(() => this.play());

    // Replay after a language switch, once the new text is on screen.
    let lastLang = this.language.lang();
    effect(() => {
      const lang = this.language.lang();
      if (lang === lastLang) return;
      lastLang = lang;
      untracked(() => afterNextRender(() => this.play(), { injector: this.injector }));
    });

    // Undo the animation and its scroll listener when the element goes away.
    inject(DestroyRef).onDestroy(() => this.media?.revert());
  }

  private play(): void {
    if (typeof window.matchMedia !== 'function') return;
    gsap.registerPlugin(ScrollTrigger); // safe to call more than once

    // Stop any earlier run and put the element back to normal before starting again.
    this.media?.revert();

    const c = { from: 'below' as SlideFrom, distance: 32, duration: 0.8, delay: 0, onScroll: true, ...(this.config() || {}) };
    const horizontal = c.from === 'left' || c.from === 'right';
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const fromStart = c.from === 'above' || c.from === (rtl ? 'right' : 'left');
    const offset = fromStart ? -c.distance : c.distance;
    const targets = c.stagger ? Array.from(this.element.children) : this.element;

    this.media = gsap.matchMedia();
    this.media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(targets, {
        [horizontal ? 'x' : 'y']: offset,
        opacity: 0,
        duration: c.duration,
        delay: c.delay,
        stagger: c.stagger ?? 0,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: c.onScroll ? { trigger: this.element, start: 'top 88%', once: true } : undefined,
      });
    });
  }
}
