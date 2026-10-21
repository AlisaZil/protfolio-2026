import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTestTranslations } from '../../../testing/translations';
import { Home } from './home';

describe('Home', () => {
  it('renders the hero', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTestTranslations()] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')!.textContent).toContain('I build things');
    expect(el.querySelector('h1')!.textContent).toContain('I figure things out.');
    expect(el.querySelectorAll('.stack-item').length).toBe(4);
    expect(el.querySelector('.kitten img')!.getAttribute('alt')).toContain('Gosha');
  });

  it('pops hearts when Gosha is clicked', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTestTranslations()] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.heart').length).toBe(0);
    el.querySelector<HTMLButtonElement>('button.kitten')!.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('.heart').length).toBe(8);
  });
});
