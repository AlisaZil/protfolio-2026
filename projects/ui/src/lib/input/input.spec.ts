import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputConfig, InputField } from './input';

@Component({
  imports: [InputField, ReactiveFormsModule],
  template: `<ui-input [config]="config()" [formControl]="control" (enterPressed)="entered()" />`,
})
class Host {
  config = signal<InputConfig>({ label: 'Name', placeholder: 'Your name' });
  control = new FormControl<string | null>('Alisa');
  entered = vi.fn();
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const host = fixture.componentInstance;
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, host, el };
}

describe('InputField', () => {
  it('links the label to the input and shows the form value', async () => {
    const { el } = await setup();
    const input = el.querySelector('input')!;
    expect(el.querySelector('label')!.getAttribute('for')).toBe(input.id);
    expect(input.value).toBe('Alisa');
    expect(input.placeholder).toBe('Your name');
  });

  it('writes typed text back to the form control', async () => {
    const { host, el } = await setup();
    const input = el.querySelector('input')!;
    input.value = 'Alisa Z';
    input.dispatchEvent(new Event('input'));
    expect(host.control.value).toBe('Alisa Z');
  });

  it('clears the field when the form is reset right after typing', async () => {
    const { host, el } = await setup();
    const input = el.querySelector('input')!;
    input.value = 'Alisa Z';
    input.dispatchEvent(new Event('input'));
    host.control.reset();
    expect(input.value).toBe('');
  });

  it('emits enterPressed', async () => {
    const { host, el } = await setup();
    el.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(host.entered).toHaveBeenCalledOnce();
  });

  it('shows the error state and message', async () => {
    const { fixture, host, el } = await setup();
    host.config.set({ label: 'Email', kind: 'email', error: 'Enter a valid email' });
    await fixture.whenStable();
    const input = el.querySelector('input')!;
    const message = el.querySelector('.error')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.classList).toContain('is-invalid');
    expect(message.textContent).toContain('Enter a valid email');
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
  });

  it('follows the form control disabled state', async () => {
    const { fixture, host, el } = await setup();
    host.control.disable();
    await fixture.whenStable();
    expect(el.querySelector('input')!.disabled).toBe(true);
  });

  it('renders a select with options', async () => {
    const { fixture, host, el } = await setup();
    host.control.setValue(null);
    host.config.set({
      label: 'Project type',
      kind: 'select',
      placeholder: 'Select a project type',
      options: [
        { value: 'web', label: 'Web App' },
        { value: 'landing', label: 'Landing Page' },
      ],
    });
    await fixture.whenStable();

    const select = el.querySelector('select')!;
    expect(select.options.length).toBe(3);
    select.value = 'landing';
    select.dispatchEvent(new Event('change'));
    expect(host.control.value).toBe('landing');
  });

  it('renders a textarea', async () => {
    const { fixture, host, el } = await setup();
    host.config.set({ label: 'Message', kind: 'textarea', rows: 6 });
    await fixture.whenStable();
    expect(el.querySelector('textarea')!.rows).toBe(6);
  });
});
