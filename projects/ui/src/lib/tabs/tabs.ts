import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  contentChildren,
  inject,
  input,
  linkedSignal,
  output,
  viewChildren,
} from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsConfig {
  tabs: TabItem[];
  activeId?: string;
  ariaLabel?: string;
}

/**
 * Marks the content for one tab:
 * <ng-template uiTabPanel="preview">…</ng-template>
 */
@Directive({ selector: 'ng-template[uiTabPanel]' })
export class TabPanel {
  readonly id = input.required<string>({ alias: 'uiTabPanel' });
  readonly template = inject(TemplateRef);
}

let nextId = 0;

@Component({
  selector: 'ui-tabs',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  readonly config = input.required<TabsConfig>();

  readonly tabChange = output<TabItem>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  protected readonly panels = contentChildren(TabPanel);
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  private readonly uid = `ui-tabs-${nextId++}`;

  protected readonly activeId = linkedSignal(() => {
    const { tabs, activeId } = this.config();
    return activeId ?? tabs.find((t) => !t.disabled)?.id ?? null;
  });

  protected tabId(id: string): string {
    return `${this.uid}-tab-${id}`;
  }

  protected panelId(id: string): string {
    return `${this.uid}-panel-${id}`;
  }

  protected select(tab: TabItem): void {
    if (tab.disabled || tab.id === this.activeId()) return;
    this.activeId.set(tab.id);
    this.tabChange.emit(tab);
  }

  /** Arrow keys, Home and End move between tabs. */
  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.config().tabs;
    const enabled = tabs.filter((t) => !t.disabled);
    const index = enabled.findIndex((t) => t.id === this.activeId());

    let target: TabItem | undefined;
    switch (event.key) {
      case 'ArrowRight':
        target = enabled[(index + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        target = enabled[(index - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        target = enabled[0];
        break;
      case 'End':
        target = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    if (!target) return;
    this.select(target);
    const buttonIndex = tabs.indexOf(target);
    this.tabButtons()[buttonIndex]?.nativeElement.focus();
  }
}
