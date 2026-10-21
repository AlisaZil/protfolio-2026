import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Navbar, NavbarConfig } from './navbar';

const config: NavbarConfig = {
  items: [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'work', label: 'Work', href: '#work' },
    { id: 'about', label: 'About', href: '#about' },
  ],
  activeId: 'work',
};

async function setup() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Navbar);
  fixture.componentRef.setInput('config', config);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.link'));
  return { fixture, el, links };
}

describe('Navbar', () => {
  it('renders the items and marks the active one', async () => {
    const { links } = await setup();
    expect(links.map((a) => a.textContent!.trim())).toEqual(['Home', 'Work', 'About']);
    expect(links[1].classList).toContain('is-active');
    expect(links[1].getAttribute('aria-current')).toBe('page');
    expect(links[0].getAttribute('aria-current')).toBeNull();
  });

  it('emits itemSelected on click', async () => {
    const { fixture, links } = await setup();
    const spy = vi.fn();
    fixture.componentInstance.itemSelected.subscribe(spy);
    links[2].click();
    expect(spy).toHaveBeenCalledWith(config.items[2]);
  });
});
