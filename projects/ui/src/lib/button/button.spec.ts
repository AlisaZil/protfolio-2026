import { TestBed } from '@angular/core/testing';
import { Button, ButtonConfig } from './button';

async function setup(config: ButtonConfig) {
  const fixture = TestBed.createComponent(Button);
  fixture.componentRef.setInput('config', config);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Button', () => {
  it('renders the label as a primary button by default', async () => {
    const { el } = await setup({ label: 'Explore my work' });
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Explore my work');
    expect(button.classList).toContain('btn--primary');
    expect(button.type).toBe('button');
  });

  it('applies the variant and size', async () => {
    const { el } = await setup({ label: 'Reset', variant: 'neutral', size: 'sm' });
    const button = el.querySelector('button')!;
    expect(button.classList).toContain('btn--neutral');
    expect(button.classList).toContain('btn--sm');
  });

  it('emits clicked, enterPressed, focused and blurred', async () => {
    const { fixture, el } = await setup({ label: 'Go' });
    const component = fixture.componentInstance;
    const spies = { clicked: vi.fn(), enter: vi.fn(), focus: vi.fn(), blur: vi.fn() };
    component.clicked.subscribe(spies.clicked);
    component.enterPressed.subscribe(spies.enter);
    component.focused.subscribe(spies.focus);
    component.blurred.subscribe(spies.blur);

    const button = el.querySelector('button')!;
    button.click();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new FocusEvent('focus'));
    button.dispatchEvent(new FocusEvent('blur'));

    expect(spies.clicked).toHaveBeenCalledOnce();
    expect(spies.enter).toHaveBeenCalledOnce();
    expect(spies.focus).toHaveBeenCalledOnce();
    expect(spies.blur).toHaveBeenCalledOnce();
  });

  it('does not emit clicked when disabled', async () => {
    const { fixture, el } = await setup({ label: 'Go', disabled: true });
    const spy = vi.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    const button = el.querySelector('button')!;
    expect(button.disabled).toBe(true);
    button.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders a link when href is set', async () => {
    const { el } = await setup({ label: 'Download résumé', href: '/cv.pdf', icon: 'download' });
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/cv.pdf');
    expect(link.hasAttribute('download')).toBe(false);
    expect(el.querySelector('ui-icon')).not.toBeNull();
  });

  it('opens link buttons in a new tab safely', async () => {
    const { el } = await setup({ label: 'Go', href: 'https://example.com', target: '_blank' });
    const link = el.querySelector('a')!;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('adds the download attribute for file links', async () => {
    const { el } = await setup({ label: 'CV', href: '/cv.pdf', download: 'My CV.pdf' });
    expect(el.querySelector('a')!.getAttribute('download')).toBe('My CV.pdf');
  });

  it('shows a spinner and blocks clicks while loading', async () => {
    const { el } = await setup({ label: 'Saving', loading: true });
    const button = el.querySelector('button')!;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelector('.spinner')).not.toBeNull();
  });
});
