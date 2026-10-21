import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icon, IconConfig } from '../icon/icon';

export interface DropdownOption {
  value: string;
  label: string;
  image?: { src: string; alt?: string };
}

export interface DropdownConfig {
  options: DropdownOption[];
  value?: string;
  ariaLabel: string;
  hideLabel?: boolean;
  imagesOnly?: boolean;
  align?: 'start' | 'end';
}

let nextId = 0;

/** Compact custom select: a button that opens a list of options with optional images. */
@Component({
  selector: 'ui-dropdown',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class Dropdown {
  readonly config = input.required<DropdownConfig>();

  /** Fires when the user picks a different option. */
  readonly valueChange = output<DropdownOption>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  protected readonly listId = `ui-dropdown-${nextId++}`;
  protected readonly chevronIcon: IconConfig = { name: 'chevron-down', size: 14 };
  protected readonly checkIcon: IconConfig = { name: 'check', size: 14 };

  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(0);
  protected readonly selected = linkedSignal(
    () => this.config().value ?? this.config().options[0]?.value,
  );
  protected readonly current = computed(() =>
    this.config().options.find((o) => o.value === this.selected()),
  );

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected toggle(): void {
    if (this.isOpen()) this.close(true);
    else this.open();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    }
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const count = this.config().options.length;
    switch (event.key) {
      case 'ArrowDown':
        this.activeIndex.update((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        this.activeIndex.update((i) => (i - 1 + count) % count);
        break;
      case 'Home':
        this.activeIndex.set(0);
        break;
      case 'End':
        this.activeIndex.set(count - 1);
        break;
      case 'Enter':
      case ' ':
        this.select(this.config().options[this.activeIndex()]);
        break;
      case 'Escape':
        this.close(true);
        break;
      case 'Tab':
        this.close();
        return; // let focus move on
      default:
        return;
    }
    event.preventDefault();
  }

  protected select(option: DropdownOption | undefined): void {
    this.close(true);
    if (!option || option.value === this.selected()) return;
    this.selected.set(option.value);
    this.valueChange.emit(option);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  private open(): void {
    if (this.isOpen()) return;
    const index = this.config().options.findIndex((o) => o.value === this.selected());
    this.activeIndex.set(Math.max(0, index));
    this.isOpen.set(true);
    this.opened.emit();
    afterNextRender(() => this.list()?.nativeElement.focus(), { injector: this.injector });
  }

  private close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.closed.emit();
    if (restoreFocus) this.trigger().nativeElement.focus();
  }
}
