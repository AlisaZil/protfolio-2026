import { Directive, Signal, computed, output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/** Shared form + event logic for Checkbox and Toggle. */
@Directive()
export abstract class BooleanControl implements ControlValueAccessor {
  readonly checkedChange = output<boolean>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  /** `disabled` from the component's config. */
  protected abstract readonly configDisabled: Signal<boolean>;

  protected readonly checked = signal(false);
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.formDisabled() || this.configDisabled());

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  protected onToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checked.set(checked);
    this.onChange(checked);
    this.checkedChange.emit(checked);
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  // ControlValueAccessor
  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
