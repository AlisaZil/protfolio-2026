import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { Icon, IconConfig } from '../icon/icon';

export type AlertKind = 'toast' | 'inline' | 'banner';
export type AlertTone = 'success' | 'info' | 'error';

export interface AlertConfig {
  message: string;
  kind?: AlertKind;
  tone?: AlertTone;
  title?: string;
  dismissible?: boolean;
  autoDismissMs?: number;
  action?: { label: string };
}

const TONE_ICONS: Record<AlertTone, IconConfig> = {
  success: { name: 'check', size: 14 },
  info: { name: 'info', size: 14 },
  error: { name: 'alert', size: 14 },
};

@Component({
  selector: 'ui-alert',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {
  readonly config = input.required<AlertConfig>();

  readonly dismissed = output<void>();
  readonly actionClicked = output<MouseEvent>();

  protected readonly cfg = computed(() => ({
    kind: 'banner' as AlertKind,
    tone: 'info' as AlertTone,
    ...this.config(),
  }));

  protected readonly icon = computed(() => TONE_ICONS[this.cfg().tone]);

  /** Shows again whenever a new config arrives. */
  protected readonly visible = linkedSignal(() => {
    this.config();
    return true;
  });

  constructor() {
    effect((onCleanup) => {
      const ms = this.cfg().autoDismissMs;
      if (!ms || !this.visible()) return;
      const timer = setTimeout(() => this.dismiss(), ms);
      onCleanup(() => clearTimeout(timer));
    });
  }

  dismiss(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.dismissed.emit();
  }
}
