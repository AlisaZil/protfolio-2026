import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTestTranslations } from '../../../testing/translations';
import { CURRENT_ROLE, RESUME } from '../../profile';
import { About } from './about';

async function setup() {
  TestBed.configureTestingModule({ providers: [provideRouter([]), provideTestTranslations()] });
  const fixture = TestBed.createComponent(About);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, cat: el.querySelector<HTMLButtonElement>('.cat')! };
}

const pointer = (type: string, pointerType: string) =>
  Object.assign(new Event(type), { pointerType }) as PointerEvent;

describe('About', () => {
  it('renders the intro, résumé link, current role and closing', async () => {
    const { el } = await setup();
    expect(el.querySelector('h1')!.textContent).toContain('Hi, I’m Alisa');
    const resume = el.querySelector<HTMLAnchorElement>('.resume a')!;
    expect(resume.getAttribute('href')).toBe(RESUME.href);
    expect(resume.getAttribute('download')).toBe(RESUME.fileName);
    expect(el.querySelector('.company')!.textContent).toBe('Achdut Israel');
    expect(el.querySelectorAll('.chips ui-chip').length).toBe(CURRENT_ROLE.tech.length);
    const cta = el.querySelector('ui-cta')!;
    expect(cta.textContent).toContain('Let’s build something.');
    expect(cta.querySelector('a')!.getAttribute('href')).toBe('/contact');
  });

  it('opens and closes the current role responsibilities', async () => {
    const { fixture, el } = await setup();
    const toggle = el.querySelector<HTMLButtonElement>('.role-toggle')!;
    const points = el.querySelector<HTMLElement>('#role-points')!;

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(points.inert).toBe(true);
    expect(points.querySelectorAll('li').length).toBe(7);
    expect(points.textContent).toContain('Angular Material');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(points.classList).toContain('is-open');
    expect(points.inert).toBe(false);

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('makes the cat look up while the mouse is over it', async () => {
    const { fixture, cat } = await setup();
    expect(cat.getAttribute('aria-pressed')).toBe('false');

    cat.dispatchEvent(pointer('pointerenter', 'mouse'));
    await fixture.whenStable();
    expect(cat.classList).toContain('is-looking-up');

    cat.click(); // clicking while hovering keeps it looking up
    await fixture.whenStable();
    expect(cat.classList).toContain('is-looking-up');

    cat.dispatchEvent(pointer('pointerleave', 'mouse'));
    await fixture.whenStable();
    expect(cat.classList).not.toContain('is-looking-up');
  });

  it('meows and pops when the cat is clicked', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const { fixture, cat } = await setup();
    const animate = vi.fn();
    cat.animate = animate;

    cat.click();
    await fixture.whenStable();
    expect(play).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledOnce();

    cat.click();
    await fixture.whenStable();
    expect(play).toHaveBeenCalledTimes(2);
    const bubbles = fixture.nativeElement.querySelectorAll('.meow');
    expect(bubbles.length).toBe(2);
    expect(bubbles[0].textContent.trim()).toBe('Meow!');
    play.mockRestore();
  });

  it('toggles the cat on tap or keyboard', async () => {
    const { fixture, cat } = await setup();
    cat.click();
    await fixture.whenStable();
    expect(cat.getAttribute('aria-pressed')).toBe('true');
    cat.click();
    await fixture.whenStable();
    expect(cat.getAttribute('aria-pressed')).toBe('false');
  });
});
