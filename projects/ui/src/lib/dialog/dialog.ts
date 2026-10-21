import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button, ButtonConfig } from '../button/button';
import { Icon } from '../icon/icon';
import { IconName } from '../types';

export type DialogCloseReason = 'confirm' | 'cancel' | 'escape' | 'backdrop' | 'close-button';

export interface DialogConfig {
  open: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  introAnimation?: boolean;
  size?: 'default' | 'large';
  actionsLayout?: 'end' | 'fill';
  confirmFirst?: boolean;
  confirm?: ButtonConfig | null;
  cancel?: ButtonConfig | null;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

let nextId = 0;

/** Modal dialog built on the native <dialog> element. Extra content can be projected inside. */
@Component({
  selector: 'ui-dialog',
  imports: [Button, Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  readonly config = input.required<DialogConfig>();

  readonly opened = output<void>();
  readonly confirmed = output<void>();
  /** Fires for every close that isn't a confirm. */
  readonly cancelled = output<DialogCloseReason>();
  readonly closed = output<DialogCloseReason>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly titleId = `ui-dialog-${nextId++}-title`;
  protected readonly messageId = `${this.titleId}-message`;

  private readonly fill = computed(() => this.config().actionsLayout === 'fill');

  protected readonly confirmButton = computed<ButtonConfig | null>(() => {
    const confirm = this.config().confirm;
    if (confirm === null) return null;
    return { label: 'Confirm', variant: 'primary', fullWidth: this.fill(), ...confirm };
  });

  protected readonly cancelButton = computed<ButtonConfig | null>(() => {
    const cancel = this.config().cancel;
    if (cancel === null) return null;
    return { label: 'Cancel', variant: 'neutral', fullWidth: this.fill(), ...cancel };
  });

  /** Reason for the close that is in progress. null = closed by config (no event). */
  private pendingReason: DialogCloseReason | null = null;

  // --- Intro animation: typed title, then the rest is revealed ---
  private readonly typedLength = signal(Number.POSITIVE_INFINITY);
  private typingTimer: ReturnType<typeof setInterval> | undefined;

  protected readonly typedTitle = computed(() => this.config().title.slice(0, this.typedLength()));
  protected readonly typing = computed(() => this.typedLength() < this.config().title.length);
  /** True while the message and buttons wait for the title to finish typing. */
  protected readonly contentWaiting = computed(() => !!this.config().introAnimation && this.typing());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTyping());

    effect(() => {
      const open = this.config().open;
      const el = this.dialogRef().nativeElement;
      if (open && !el.open) {
        if (typeof el.showModal === 'function') el.showModal();
        else el.setAttribute('open', '');
        if (this.config().introAnimation) this.startTyping();
        this.opened.emit();
      } else if (!open && el.open) {
        this.pendingReason = null;
        this.closeElement(el);
      }
    });
  }

  close(reason: DialogCloseReason): void {
    const el = this.dialogRef().nativeElement;
    if (!el.open) return;
    this.pendingReason = reason;
    this.closeElement(el);
  }

  /** Native `close` event: the single place where close outputs fire. */
  protected onNativeClose(): void {
    const reason = this.pendingReason;
    this.pendingReason = null;
    if (reason === null) return;

    this.closed.emit(reason);
    if (reason === 'confirm') this.confirmed.emit();
    else this.cancelled.emit(reason);
  }

  /** Escape key. */
  protected onCancelEvent(event: Event): void {
    event.preventDefault();
    if (this.config().closeOnEscape ?? true) this.close('escape');
  }

  /** Clicks on the dialog element itself (not its content) are backdrop clicks. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialogRef().nativeElement && (this.config().closeOnBackdrop ?? true)) {
      this.close('backdrop');
    }
  }

  private startTyping(): void {
    this.stopTyping();
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.typedLength.set(Number.POSITIVE_INFINITY);
      return;
    }
    this.typedLength.set(0);
    this.typingTimer = setInterval(() => {
      this.typedLength.update((n) => n + 1);
      if (!this.typing()) this.stopTyping();
    }, 45);
  }

  private stopTyping(): void {
    clearInterval(this.typingTimer);
    this.typingTimer = undefined;
  }

  private closeElement(el: HTMLDialogElement): void {
    this.stopTyping();
    this.typedLength.set(Number.POSITIVE_INFINITY);
    if (typeof el.close === 'function') {
      el.close();
    } else {
      // Environments without <dialog> support (e.g. some test runners).
      el.removeAttribute('open');
      this.onNativeClose();
    }
  }
}
