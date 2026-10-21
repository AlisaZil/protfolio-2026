import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanControl } from '../forms/boolean-control';

export interface ToggleConfig {
  label: string;
  disabled?: boolean;
  labelPosition?: 'start' | 'end';
  id?: string;
}

let nextId = 0;

/** On/off switch. The value goes through Angular forms, or listen to `checkedChange`. */
@Component({
  selector: 'ui-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label
      class="wrapper"
      [class.is-disabled]="isDisabled()"
      [class.label-start]="config().labelPosition === 'start'"
    >
      <input
        type="checkbox"
        role="switch"
        class="switch"
        [id]="id()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        (change)="onToggle($event)"
        (focus)="focused.emit($event)"
        (blur)="onBlur($event)"
      />
      <span>{{ config().label }}</span>
    </label>
  `,
  styleUrl: './toggle.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Toggle), multi: true }],
})
export class Toggle extends BooleanControl {
  readonly config = input.required<ToggleConfig>();

  private readonly generatedId = `ui-toggle-${nextId++}`;
  protected readonly id = computed(() => this.config().id ?? this.generatedId);
  protected readonly configDisabled = computed(() => !!this.config().disabled);
}
