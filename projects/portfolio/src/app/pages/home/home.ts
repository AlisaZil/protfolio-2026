import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Button, ButtonConfig } from 'ui';
import { pop } from '../../shared/pop';
import { techLogo } from '../../data/tech';
import { SlideIn } from '../../shared/slide-in';
import { LanguageService } from '../../language/language.service';

/** One heart in a burst; offsets are where it floats to, from the middle of Gosha. */
interface Heart {
  id: number;
  dx: number;
  dy: number;
  rotate: number;
  size: number;
  color: string;
}

const HEART_COLORS = ['#ff168a', '#ff5fa8', '#ffb3d6'];
const HEARTS_PER_CLICK = 8;
const HEART_LIFETIME_MS = 1500;

@Component({
  selector: 'app-home',
  imports: [Button, SlideIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  protected readonly exploreButton = computed<ButtonConfig>(() => ({
    label: this.language.t('home.explore'),
    icon: 'arrow-right',
    size: 'lg',
  }));

  protected readonly contactButton = computed<ButtonConfig>(() => ({
    label: this.language.t('home.contact'),
    variant: 'secondary',
    icon: 'arrow-up-right',
    size: 'lg',
  }));

  // Technology names stay the same in every language. Logos come from data/tech.ts
  // (our own markup, so it's safe to insert as-is).
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly techStack = ['Angular', 'TypeScript', 'RxJS', 'SCSS'].map((label) => ({
    label,
    logo: this.sanitizer.bypassSecurityTrustHtml(techLogo(label) ?? ''),
  }));

  // --- Gosha: click (or Enter) to make him pop (same as Grisha on About) and send out hearts ---

  private readonly kittenButton = viewChild.required<ElementRef<HTMLButtonElement>>('kittenButton');

  protected onKittenClick(): void {
    pop(this.kittenButton().nativeElement);
    this.popHearts();
  }

  protected readonly heartPath =
    'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z';
  protected readonly hearts = signal<Heart[]>([]);
  private nextHeartId = 0;

  private popHearts(): void {
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const burst: Heart[] = Array.from({ length: HEARTS_PER_CLICK }, (_, i) => ({
      id: this.nextHeartId++,
      // Out to the sides: half left, half right, drifting only slightly up or down
      dx: (i % 2 === 0 ? -1 : 1) * random(130, 260),
      dy: random(-70, 30),
      rotate: random(-35, 35),
      size: random(0.7, 1.3),
      color: HEART_COLORS[i % HEART_COLORS.length],
    }));
    this.hearts.update((hearts) => [...hearts, ...burst]);
    setTimeout(() => {
      this.hearts.update((hearts) => hearts.filter((h) => !burst.includes(h)));
    }, HEART_LIFETIME_MS);
  }

  protected go(path: string): void {
    this.router.navigateByUrl(path);
  }
}
