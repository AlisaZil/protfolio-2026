import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputKind =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'number'
  | 'search'
  | 'textarea'
  | 'select';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface InputConfig {
  label: string;
  kind?: InputKind;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: SelectOption[];
  rows?: number;
  maxLength?: number;
  autocomplete?: string;
  hideLabel?: boolean;
  id?: string;
}

let nextId = 0;

/**
 * Text input, textarea or select. The value goes through Angular forms
 * (`formControl`, `formControlName` or `ngModel`), or listen to `valueChange`.
 */
@Component({
  selector: 'ui-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputField), multi: true },
  ],
})
export class InputField implements ControlValueAccessor {
  readonly config = input.required<InputConfig>();

  readonly valueChange = output<string>();
  readonly enterPressed = output<KeyboardEvent>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  private readonly generatedId = `ui-input-${nextId++}`;
  protected readonly id = computed(() => this.config().id ?? this.generatedId);
  protected readonly messageId = computed(() => `${this.id()}-message`);

  protected readonly kind = computed(() => this.config().kind ?? 'text');
  protected readonly value = signal('');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.formDisabled() || !!this.config().disabled);
  protected readonly hasError = computed(() => !!this.config().error);
  protected readonly describedBy = computed(() =>
    this.config().error || this.config().hint ? this.messageId() : null,
  );

  private readonly controlRef =
    viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>('control');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)
      .value;
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  protected onEnter(event: Event): void {
    this.enterPressed.emit(event as KeyboardEvent);
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  // ControlValueAccessor
  writeValue(value: string | number | null | undefined): void {
    const text = value == null ? '' : String(value);
    this.value.set(text);
    // Also write to the element directly (like Angular's own inputs), so a form
    // reset clears the field even if the template hasn't re-rendered since typing.
    const element = this.controlRef()?.nativeElement;
    if (element && element.value !== text) element.value = text;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
