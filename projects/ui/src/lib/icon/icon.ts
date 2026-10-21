import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconName } from '../types';

export interface IconConfig {
  name: IconName;
  size?: number;
  label?: string;
}

/** Icons that point "forward" and should mirror in right-to-left languages. */
const DIRECTIONAL: ReadonlySet<IconName> = new Set(['arrow-right', 'arrow-up-right', 'external-link']);

const PATHS: Record<IconName, string> = {
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  'arrow-up-right': 'M7 17L17 7M8 7h9v9',
  'external-link': 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-up': 'M6 15l6-6 6 6',
  sort: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  'more-vertical': 'M12 5h.01M12 12h.01M12 19h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  info: 'M12 11v6M12 7.5h.01',
  alert: 'M12 7v6M12 16.5h.01',
  database:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  box: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  zap: 'M13 2L4 14h7l-1 8 9-12h-7z',
  brush:
    'M20.2 3.8a1.9 1.9 0 0 1 0 2.7L10 16.7 7.3 14 17.5 3.8a1.9 1.9 0 0 1 2.7 0zM14.6 6.7l2.7 2.7M7 14.3c-2 0-3.5 1.6-3.5 3.5 0 1.3-.7 2.2-1.5 2.7 3.2 1 7.5-.2 7.5-3.7',
  'file-text': 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  smartphone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9h.01',
  linkedin:
    'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM8 10.5V16M8 7.5h.01M12 16v-5.5M12 13c0-1.7 1-2.7 2.4-2.7 1.5 0 2.1 1 2.1 2.7V16',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  whatsapp:
    'M4 20l1.3-3.9A8 8 0 1 1 8 19.1zM9.2 8.6c-.5 3.3 2.9 6.6 6.2 6.2l.8-1.5-2-1-.9.7a4 4 0 0 1-2.4-2.4l.7-.9-1-2z',
  github:
    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5.1 5.1 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5.1 5.1 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.3 6.6 6.4 7A3.4 3.4 0 0 0 9 18.1V22',
  instagram:
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4zM17.5 6.5h.01',
  dribbble:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.6 2.7c4.3 5.9 5.9 11 7.1 18.4M19.1 5c-3.4 3.9-8.6 6-15.7 6.1M21.8 12.9c-6.3-1.8-12.3-.6-16.5 6',
};

@Component({
  selector: 'ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host { display: inline-flex; flex: none; }
    svg { display: block; }
    :host(.is-directional:dir(rtl)) svg { transform: scaleX(-1); }
  `,
  host: {
    '[class.is-directional]': 'directional()',
    '[attr.role]': 'config().label ? "img" : null',
    '[attr.aria-label]': 'config().label || null',
    '[attr.aria-hidden]': 'config().label ? null : "true"',
  },
})
export class Icon {
  readonly config = input.required<IconConfig>();

  protected readonly size = computed(() => this.config().size ?? 16);
  protected readonly path = computed(() => PATHS[this.config().name]);
  protected readonly directional = computed(() => DIRECTIONAL.has(this.config().name));
}
