import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { CHIP_GROUP, Chip, ChipConfig, ChipGroupApi } from './chip';

export interface ChipGroupConfig {
  chips: ChipConfig[];
  selectedIds?: string[];
  multiple?: boolean;
  allowEmpty?: boolean;
  ariaLabel?: string;
}

@Component({
  selector: 'ui-chip-group',
  imports: [Chip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CHIP_GROUP, useExisting: forwardRef(() => ChipGroup) }],
  template: `
    @for (chip of chips(); track chip.id) {
      <ui-chip [config]="chip" />
    }
  `,
  styles: `
    :host { display: flex; flex-wrap: wrap; gap: 10px; }
  `,
  host: {
    role: 'group',
    '[attr.aria-label]': 'config().ariaLabel || null',
  },
})
export class ChipGroup implements ChipGroupApi {
  readonly config = input.required<ChipGroupConfig>();

  /** Emits the full list of selected ids after every change. */
  readonly selectionChange = output<string[]>();

  protected readonly chips = computed(() =>
    this.config().chips.map((chip) => ({ ...chip, kind: 'filter' as const })),
  );

  private readonly selected = linkedSignal(() => this.config().selectedIds ?? []);

  isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  toggle(id: string): void {
    const { multiple, allowEmpty } = this.config();
    const current = this.selected();
    const has = current.includes(id);

    let next: string[];
    if (multiple) {
      next = has ? current.filter((x) => x !== id) : [...current, id];
    } else {
      next = has ? [] : [id];
    }

    if (next.length === 0 && !allowEmpty) return;
    this.selected.set(next);
    this.selectionChange.emit(next);
  }
}
