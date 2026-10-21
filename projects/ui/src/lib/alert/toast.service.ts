import { Injectable, signal } from '@angular/core';
import { AlertConfig } from './alert';

export interface ToastItem {
  id: number;
  config: AlertConfig;
}

/**
 * Shows toasts from anywhere in the app.
 * Place <ui-toast-container /> once (e.g. in the root component).
 *
 *   inject(ToastService).show({ tone: 'success', title: 'Message sent!', message: '…' });
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly items = signal<ToastItem[]>([]);

  readonly toasts = this.items.asReadonly();

  /** Shows a toast and returns its id. Toasts close after 5s unless `autoDismissMs` says otherwise. */
  show(config: Omit<AlertConfig, 'kind'>): number {
    const id = ++this.nextId;
    const toast: ToastItem = {
      id,
      config: { dismissible: true, autoDismissMs: 5000, ...config, kind: 'toast' },
    };
    this.items.update((items) => [...items, toast]);
    return id;
  }

  dismiss(id: number): void {
    this.items.update((items) => items.filter((t) => t.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }
}
