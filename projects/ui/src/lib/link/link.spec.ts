import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Link, LinkConfig } from './link';

async function setup(config: LinkConfig) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Link);
  fixture.componentRef.setInput('config', config);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Link', () => {
  it('renders an external link with safe rel for new tabs', async () => {
    const { el } = await setup({ label: 'GitHub', href: 'https://github.com', target: '_blank' });
    const a = el.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('https://github.com');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('can make a file link download', async () => {
    const { el } = await setup({ label: 'CV', href: '/cv.pdf', download: 'My CV.pdf' });
    expect(el.querySelector('a')!.getAttribute('download')).toBe('My CV.pdf');
  });

  it('renders a router link', async () => {
    const { el } = await setup({ label: 'Work', routerLink: '/work' });
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/work');
  });

  it('renders a button when there is no destination, and emits clicked', async () => {
    const { fixture, el } = await setup({ label: 'View project', icon: 'arrow-right' });
    const spy = vi.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    el.querySelector('button')!.click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('renders a non-interactive element when disabled', async () => {
    const { el } = await setup({ label: 'View project', href: '/x', disabled: true });
    expect(el.querySelector('a')).toBeNull();
    expect(el.querySelector('[aria-disabled="true"]')).not.toBeNull();
  });
});
