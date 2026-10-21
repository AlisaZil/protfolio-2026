import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { IconName, RouterLinkCommands } from '../types';

export interface LinkConfig {
  label: string;
  routerLink?: RouterLinkCommands;
  href?: string;
  target?: '_self' | '_blank';
  download?: boolean | string;
  icon?: IconName;
  disabled?: boolean;
  ariaLabel?: string;
}

@Component({
  selector: 'ui-link',
  imports: [Icon, NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link.html',
  styleUrl: './link.scss',
})
export class Link {
  readonly config = input.required<LinkConfig>();

  readonly clicked = output<MouseEvent>();
  readonly enterPressed = output<KeyboardEvent>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  protected onEnter(event: Event): void {
    this.enterPressed.emit(event as KeyboardEvent);
  }
}
