import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Chip, ChipConfig, Cta, CtaConfig, Icon, IconConfig, Link, LinkConfig } from 'ui';
import { pop } from '../../shared/pop';
import { SlideIn } from '../../shared/slide-in';
import { LanguageService } from '../../language/language.service';
import { techChip } from '../../data/tech';
import { CURRENT_ROLE, RESUME } from '../../profile';

const MEOW_SOUND = 'sounds/meow.mp3';
const MEOW_PITCH = 0.8;
const MEOW_VOLUME = 0.75;

interface MeowBubble {
  id: number;
  x: number;
  y: number;
  tilt: number;
}

@Component({
  selector: 'app-about',
  imports: [Chip, Cta, Icon, Link, SlideIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly language = inject(LanguageService);
  protected readonly role = CURRENT_ROLE;

  protected readonly resumeLink = computed<LinkConfig>(() => ({
    label: this.language.t('about.resume'),
    href: RESUME.href,
    download: RESUME.fileName,
    icon: 'arrow-down',
  }));

  protected readonly roleOpen = signal(false);
  protected readonly chevronIcon: IconConfig = { name: 'chevron-down', size: 22 };

  private readonly pointIds = ['apps', 'components', 'finance', 'data', 'apis', 'ownership', 'ai'];

  protected readonly rolePoints = computed(() =>
    this.pointIds.map((id) => ({ id, text: this.language.t(`about.role.points.${id}`) })),
  );

  protected readonly techChips: ChipConfig[] = CURRENT_ROLE.tech.map(techChip);

  protected readonly cta = computed<CtaConfig>(() => ({
    variant: 'compact',
    eyebrow: this.language.t('about.cta.eyebrow'),
    title: this.language.t('about.cta.title'),
    link: { label: this.language.t('about.cta.link'), routerLink: '/contact', icon: 'arrow-up-right' },
  }));

  protected readonly lookingUp = signal(false);
  private hovering = false;

  private readonly catButton = viewChild.required<ElementRef<HTMLButtonElement>>('catButton');
  private meow: HTMLAudioElement | undefined;
  private nextMeowId = 0;
  protected readonly meowBubbles = signal<MeowBubble[]>([]);

  protected onPointerEnter(event: PointerEvent): void {
    this.loadMeow();
    if (event.pointerType !== 'mouse') return;
    this.hovering = true;
    this.lookingUp.set(true);
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.hovering = false;
    this.lookingUp.set(false);
  }

  protected onCatClick(): void {
    // With a mouse, hovering already did it; taps and keyboard toggle.
    if (!this.hovering) this.lookingUp.update((up) => !up);
    pop(this.catButton().nativeElement);
    this.playMeow();
    this.showMeowBubble();
  }

  private showMeowBubble(): void {
    const bubble: MeowBubble = {
      id: this.nextMeowId++,
      x: 2 + Math.random() * 14,
      y: 8 + Math.random() * 14,
      tilt: -14 + Math.random() * 18,
    };
    this.meowBubbles.update((bubbles) => [...bubbles.slice(-4), bubble]);
    setTimeout(() => this.meowBubbles.update((bubbles) => bubbles.filter((b) => b !== bubble)), 1200);
  }

  private loadMeow(): HTMLAudioElement | undefined {
    if (!this.meow && typeof Audio === 'function') {
      this.meow = new Audio(MEOW_SOUND);
      this.meow.preload = 'auto';
      this.meow.volume = MEOW_VOLUME;
      this.meow.preservesPitch = false; // let the slower speed lower the pitch too
    }
    return this.meow;
  }

  private playMeow(): void {
    const meow = this.loadMeow();
    if (!meow) return;
    meow.currentTime = 0;
    meow.playbackRate = MEOW_PITCH;
    try {
      meow.play()?.catch(() => {}); // the browser may block sound; the click still works
    } catch {}
  }
}
