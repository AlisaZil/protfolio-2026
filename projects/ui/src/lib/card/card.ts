import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Chip, ChipConfig } from '../chip/chip';
import { Link, LinkConfig } from '../link/link';

interface CardBase {
  interactive?: boolean;
}

export interface ProjectCardConfig extends CardBase {
  variant: 'project';
  title: string;
  description?: string;
  image?: { src: string; alt: string };
  tags?: ChipConfig[];
  link?: LinkConfig;
}

export interface ExperienceCardConfig extends CardBase {
  variant: 'experience';
  company: string;
  role: string;
  period: { start: string; end?: string };
  description: string;
}

export interface SkillCardConfig extends CardBase {
  variant: 'skill';
  title: string;
  skills: ChipConfig[];
}

export type CardConfig = ProjectCardConfig | ExperienceCardConfig | SkillCardConfig;

@Component({
  selector: 'ui-card',
  imports: [Chip, Link],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  host: {
    '[class]': '"card card--" + config().variant',
    '[class.is-interactive]': 'config().interactive',
    '[attr.tabindex]': 'config().interactive ? 0 : null',
    '(click)': 'onCardClick($event)',
    '(keydown.enter)': 'onCardEnter($event)',
  },
})
export class Card {
  readonly config = input.required<CardConfig>();

  /** Interactive cards only: the card itself was clicked or Enter was pressed on it. */
  readonly clicked = output<MouseEvent | KeyboardEvent>();
  readonly linkClicked = output<MouseEvent>();
  readonly tagClicked = output<ChipConfig>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly project = computed(() => {
    const c = this.config();
    return c.variant === 'project' ? c : null;
  });

  protected readonly experience = computed(() => {
    const c = this.config();
    return c.variant === 'experience' ? c : null;
  });

  protected readonly skill = computed(() => {
    const c = this.config();
    return c.variant === 'skill' ? c : null;
  });

  protected onCardClick(event: MouseEvent): void {
    if (this.config().interactive) this.clicked.emit(event);
  }

  protected onCardEnter(event: Event): void {
    // Only when the card itself has focus, not a link or chip inside it.
    if (this.config().interactive && event.target === this.host.nativeElement) {
      this.clicked.emit(event as KeyboardEvent);
    }
  }

  protected onLink(event: MouseEvent): void {
    event.stopPropagation(); // don't also fire the card's `clicked`
    this.linkClicked.emit(event);
  }

  protected onTag(tag: ChipConfig, event: MouseEvent): void {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
