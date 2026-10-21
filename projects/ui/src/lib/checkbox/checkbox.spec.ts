import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Toggle } from '../toggle/toggle';
import { Checkbox } from './checkbox';

@Component({
  imports: [Checkbox, Toggle, ReactiveFormsModule],
  template: `
    <ui-checkbox
      [config]="{ label: 'Send me a copy' }"
      [formControl]="copy"
      (checkedChange)="copyChanged($event)"
    />
    <ui-toggle
      [config]="{ label: 'Email updates' }"
      [formControl]="updates"
      (checkedChange)="updatesChanged($event)"
    />
  `,
})
class Host {
  copy = new FormControl(false);
  updates = new FormControl(true);
  copyChanged = vi.fn();
  updatesChanged = vi.fn();
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    checkbox: el.querySelector<HTMLInputElement>('ui-checkbox input')!,
    toggle: el.querySelector<HTMLInputElement>('ui-toggle input')!,
    el,
  };
}

describe('Checkbox and Toggle', () => {
  it('show the form values', async () => {
    const { checkbox, toggle } = await setup();
    expect(checkbox.checked).toBe(false);
    expect(toggle.checked).toBe(true);
    expect(toggle.getAttribute('role')).toBe('switch');
  });

  it('update the form and emit checkedChange on click', async () => {
    const { host, checkbox, toggle } = await setup();
    checkbox.click();
    toggle.click();
    expect(host.copy.value).toBe(true);
    expect(host.copyChanged).toHaveBeenCalledWith(true);
    expect(host.updates.value).toBe(false);
    expect(host.updatesChanged).toHaveBeenCalledWith(false);
  });

  it('clicking the label text toggles the checkbox', async () => {
    const { host, el } = await setup();
    el.querySelector<HTMLElement>('ui-checkbox span')!.click();
    expect(host.copy.value).toBe(true);
  });

  it('follow the form disabled state', async () => {
    const { fixture, host, checkbox } = await setup();
    host.copy.disable();
    await fixture.whenStable();
    expect(checkbox.disabled).toBe(true);
  });
});
