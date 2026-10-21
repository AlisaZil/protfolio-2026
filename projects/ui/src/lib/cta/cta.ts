import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button, ButtonConfig } from '../button/button';
import { Link, LinkConfig } from '../link/link';

export interface CtaConfig {
  title: string;
  text?: string;
  eyebrow?: string;
  action?: ButtonConfig;
  link?: LinkConfig;
  variant?: 'default' | 'compact';
}

/** Call-to-action band: "Let's build something thoughtful." */
@Component({
  selector: 'ui-cta',
  imports: [Button, Link],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = config();
    <section class="cta" [class.cta--compact]="c.variant === 'compact'">
      <div class="copy">
        @if (c.eyebrow) {
          <p class="eyebrow">{{ c.eyebrow }}</p>
        }
        <h2 class="title">{{ c.title }}</h2>
        @if (c.text) {
          <p class="text">{{ c.text }}</p>
        }
      </div>
      @if (action(); as action) {
        <ui-button [config]="action" (clicked)="actionClicked.emit($event)" />
      }
      @if (c.link; as link) {
        <ui-link class="link" [config]="link" (clicked)="actionClicked.emit($event)" />
      }
    </section>
  `,
  styleUrl: './cta.scss',
})
export class Cta {
  readonly config = input.required<CtaConfig>();

  /** Fires for the button or the link. */
  readonly actionClicked = output<MouseEvent>();

  protected readonly action = computed<ButtonConfig | null>(() => {
    const action = this.config().action;
    return action ? { size: 'lg', ...action } : null;
  });
}
