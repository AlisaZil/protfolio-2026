import { TestBed } from '@angular/core/testing';
import { Dropdown, DropdownConfig } from './dropdown';

const config: DropdownConfig = {
  ariaLabel: 'Language',
  options: [
    { value: 'en', label: 'English', image: { src: 'flags/us.svg' } },
    { value: 'he', label: 'עברית', image: { src: 'flags/il.svg' } },
  ],
};

async function setup(overrides: Partial<DropdownConfig> = {}) {
  const fixture = TestBed.createComponent(Dropdown);
  fixture.componentRef.setInput('config', { ...config, ...overrides });
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const trigger = el.querySelector<HTMLButtonElement>('.trigger')!;
  const options = () => Array.from(el.querySelectorAll<HTMLElement>('[role="option"]'));
  return { fixture, el, trigger, options, component: fixture.componentInstance };
}

describe('Dropdown', () => {
  it('shows the selected option with its image and label', async () => {
    const { trigger } = await setup({ value: 'he' });
    expect(trigger.textContent).toContain('עברית');
    expect(trigger.querySelector('img')!.getAttribute('src')).toBe('flags/il.svg');
    expect(trigger.getAttribute('aria-label')).toBe('Language: עברית');
  });

  it('opens on click and emits valueChange when a new option is picked', async () => {
    const { fixture, trigger, options, component } = await setup();
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(options().length).toBe(2);

    options()[1].click();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(config.options[1]);
    expect(trigger.textContent).toContain('עברית');
    expect(options().length).toBe(0);
  });

  it('does not emit when the current option is picked again', async () => {
    const { fixture, trigger, options, component } = await setup();
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    trigger.click();
    await fixture.whenStable();
    options()[0].click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('works with the keyboard', async () => {
    const { fixture, el, trigger, component } = await setup();
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await fixture.whenStable();
    const list = el.querySelector<HTMLElement>('[role="listbox"]')!;
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).toHaveBeenCalledWith(config.options[1]);
  });

  it('can show images only, keeping names for screen readers', async () => {
    const { fixture, trigger, options } = await setup({ imagesOnly: true });
    expect(trigger.querySelector('.label')).toBeNull();
    expect(trigger.getAttribute('aria-label')).toBe('Language: English');
    trigger.click();
    await fixture.whenStable();
    const hebrew = options()[1];
    expect(hebrew.querySelector('img')).not.toBeNull();
    expect(hebrew.querySelector('.visually-hidden')!.textContent).toBe('עברית');
    expect(hebrew.getAttribute('title')).toBe('עברית');
  });

  it('can hide the label in the button', async () => {
    const { trigger } = await setup({ hideLabel: true });
    expect(trigger.querySelector('.label')).toBeNull();
    expect(trigger.querySelector('img')).not.toBeNull();
  });
});
