import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TabItem, TabPanel, Tabs, TabsConfig } from './tabs';

@Component({
  imports: [Tabs, TabPanel],
  template: `
    <ui-tabs [config]="config" (tabChange)="changed($event)">
      <ng-template uiTabPanel="preview">Preview content</ng-template>
      <ng-template uiTabPanel="code">Code content</ng-template>
    </ui-tabs>
  `,
})
class Host {
  config: TabsConfig = {
    tabs: [
      { id: 'preview', label: 'Preview' },
      { id: 'code', label: 'Code' },
    ],
  };
  changed = vi.fn<(tab: TabItem) => void>();
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const tabs = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panel = () => el.querySelector('[role="tabpanel"]')!.textContent!.trim();
  return { fixture, el, tabs, panel };
}

describe('Tabs', () => {
  it('shows the first tab by default', async () => {
    const { tabs, panel } = await setup();
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(panel()).toBe('Preview content');
  });

  it('switches tab on click and emits tabChange', async () => {
    const { fixture, tabs, panel } = await setup();
    tabs()[1].click();
    await fixture.whenStable();
    expect(panel()).toBe('Code content');
    expect(fixture.componentInstance.changed).toHaveBeenCalledWith({ id: 'code', label: 'Code' });
  });

  it('moves between tabs with the arrow keys', async () => {
    const { fixture, tabs, panel } = await setup();
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(panel()).toBe('Code content');
    expect(tabs()[1].tabIndex).toBe(0);
    expect(tabs()[0].tabIndex).toBe(-1);
  });
});
