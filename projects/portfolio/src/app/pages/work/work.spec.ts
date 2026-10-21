import { TestBed } from '@angular/core/testing';
import { PROJECTS } from '../../data/projects';
import { provideTestTranslations } from '../../../testing/translations';
import { Work } from './work';

async function setup() {
  TestBed.configureTestingModule({ providers: [provideTestTranslations()] });
  const fixture = TestBed.createComponent(Work);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const filter = async (label: string) => {
    const button = Array.from(el.querySelectorAll<HTMLButtonElement>('ui-chip-group button')).find(
      (b) => b.textContent!.trim() === label,
    )!;
    button.click();
    await fixture.whenStable();
  };
  return { fixture, el, filter, cardCount: () => el.querySelectorAll('ui-card').length };
}

describe('Work', () => {
  it('shows every project with the "All" filter selected', async () => {
    const { el, cardCount } = await setup();
    expect(cardCount()).toBe(PROJECTS.length);
    const all = el.querySelector('ui-chip-group button')!;
    expect(all.getAttribute('aria-pressed')).toBe('true');
  });

  it('filters projects by category', async () => {
    const { filter, cardCount } = await setup();
    await filter('Enterprise');
    expect(cardCount()).toBe(PROJECTS.filter((p) => p.category === 'enterprise').length);
    await filter('All');
    expect(cardCount()).toBe(PROJECTS.length);
  });
});
