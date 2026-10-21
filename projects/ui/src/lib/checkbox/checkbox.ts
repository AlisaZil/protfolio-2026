import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanControl } from '../forms/boolean-control';

export interface CheckboxConfig {
  label: string;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  id?: string;
}

let nextId = 0;

/** Checkbox. The value goes through Angular forms, or listen to `checkedChange`. */
@Component({
  selector: 'ui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="wrapper" [class.is-disabled]="isDisabled()">
      <input
        type="checkbox"
        class="box"
        [id]="id()"
        [checked]="checked()"
        [indeterminate]="!!config().indeterminate"
        [disabled]="isDisabled()"
        [required]="!!config().required"
        (change)="onToggle($event)"
        (focus)="focused.emit($event)"
        (blur)="onBlur($event)"
      />
      <span>{{ config().label }}</span>
    </label>
  `,
  styleUrl: './checkbox.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true },
  ],
})
export class Checkbox extends BooleanControl {
  readonly config = input.required<CheckboxConfig>();

  private readonly generatedId = `ui-checkbox-${nextId++}`;
  protected readonly id = computed(() => this.config().id ?? this.generatedId);
  protected readonly configDisabled = computed(() => !!this.config().disabled);
}
