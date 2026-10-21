import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Icon } from '../icon/icon';

export type ChipKind = 'filter' | 'tech';
export type ChipColor = 'pink' | 'lavender' | 'neutral';

export interface ChipConfig {
  id: string;
  label: string;
  kind?: ChipKind;
  color?: ChipColor;
  selected?: boolean;
  disabled?: boolean;
  removable?: boolean;
  interactive?: boolean;
  logo?: string;
  logoSvg?: string;
}

export interface ChipGroupApi {
  isSelected(id: string): boolean;
  toggle(id: string): void;
}

export const CHIP_GROUP = new InjectionToken<ChipGroupApi>('CHIP_GROUP');

@Component({
  selector: 'ui-chip',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  host: { '[class]': 'hostClasses()' },
})
export class Chip {
  readonly config = input.required<ChipConfig>();

  readonly clicked = output<MouseEvent>();
  readonly selectedChange = output<boolean>();
  readonly removed = output<ChipConfig>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  private readonly group = inject(CHIP_GROUP, { optional: true });
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly logoMarkup = computed(() => {
    const svg = this.config().logoSvg;
    return svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : null;
  });

  protected readonly cfg = computed(() => ({
    kind: 'tech' as ChipKind,
    color: 'neutral' as ChipColor,
    ...this.config(),
  }));

  /** Own state when used alone; resets whenever a new config arrives. */
  private readonly selfSelected = linkedSignal(() => !!this.config().selected);

  protected readonly isSelected = computed(() =>
    this.group ? this.group.isSelected(this.cfg().id) : this.selfSelected(),
  );

  protected readonly isButton = computed(
    () => this.cfg().kind === 'filter' || !!this.cfg().interactive,
  );

  protected readonly hostClasses = computed(() => {
    const c = this.cfg();
    const classes = ['chip', `chip--${c.kind}`];
    if (c.kind === 'tech') classes.push(`chip--${c.color}`);
    if (c.kind === 'filter' && this.isSelected()) classes.push('is-selected');
    if (c.disabled) classes.push('is-disabled');
    if (c.removable) classes.push('is-removable');
    return classes.join(' ');
  });

  protected onClick(event: MouseEvent): void {
    const c = this.cfg();
    if (c.disabled) return;
    this.clicked.emit(event);
    if (c.kind !== 'filter') return;

    if (this.group) {
      this.group.toggle(c.id);
    } else {
      this.selfSelected.update((v) => !v);
    }
    this.selectedChange.emit(this.isSelected());
  }
}
