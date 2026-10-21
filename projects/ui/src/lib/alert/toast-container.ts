import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Alert } from './alert';
import { ToastService } from './toast.service';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastContainerConfig {
  position?: ToastPosition;
}

/** Renders the toasts from ToastService. Place it once in the app. */
@Component({
  selector: 'ui-toast-container',
  imports: [Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <ui-alert [config]="toast.config" (dismissed)="toastService.dismiss(toast.id)" />
    }
  `,
  styleUrl: './toast-container.scss',
  host: {
    '[class]': 'positionClass()',
    'aria-live': 'polite',
  },
})
export class ToastContainer {
  readonly config = input<ToastContainerConfig>({});

  protected readonly toastService = inject(ToastService);
  protected readonly positionClass = computed(
    () => `pos-${this.config().position ?? 'bottom-right'}`,
  );
}
