import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../types';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonConfig {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  href?: string;
  download?: boolean | string;
  target?: '_self' | '_blank';
  fullWidth?: boolean;
  ariaLabel?: string;
}

@Component({
  selector: 'ui-button',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: { '[class.full-width]': 'cfg().fullWidth' },
})
export class Button {
  readonly config = input.required<ButtonConfig>();

  readonly clicked = output<MouseEvent>();
  readonly enterPressed = output<KeyboardEvent>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();
  readonly hoverStart = output<MouseEvent>();
  readonly hoverEnd = output<MouseEvent>();

  protected readonly cfg = computed(() => ({
    variant: 'primary' as ButtonVariant,
    size: 'md' as ButtonSize,
    type: 'button' as const,
    iconPosition: 'end' as const,
    ...this.config(),
  }));

  protected readonly classes = computed(() => {
    const c = this.cfg();
    return `btn btn--${c.variant} btn--${c.size}`;
  });

  /** Value for the link's `download` attribute (null = no attribute). */
  protected readonly downloadAttr = computed(() => {
    const download = this.cfg().download;
    return download === true ? '' : download || null;
  });

  protected onEnter(event: Event): void {
    this.enterPressed.emit(event as KeyboardEvent);
  }
}
