import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer, FooterConfig } from './footer';

const config: FooterConfig = {
  copyright: '© 2026 Alisa Zilberman',
  links: [
    { id: 'work', label: 'Work', routerLink: '/work' },
    { id: 'about', label: 'About', routerLink: '/about' },
    { id: 'contact', label: 'Contact', href: 'mailto:hello@example.com' },
  ],
  status: { label: 'Open to freelance opportunities', available: true },
};

describe('Footer', () => {
  it('renders copyright, links and status, and emits linkClicked', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] });
    const fixture = TestBed.createComponent(Footer);
    fixture.componentRef.setInput('config', config);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const spy = vi.fn();
    fixture.componentInstance.linkClicked.subscribe(spy);

    expect(el.querySelector('.copyright')!.textContent).toBe('© 2026 Alisa Zilberman');
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.link'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/work',
      '/about',
      'mailto:hello@example.com',
    ]);
    expect(el.querySelector('.status')!.classList).toContain('is-available');

    links[1].click();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ link: config.links![1] }));
  });
});
