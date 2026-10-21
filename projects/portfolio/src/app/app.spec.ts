import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTestTranslations } from '../testing/translations';
import { SOCIAL_LINKS } from './profile';
import { SocialClicks } from './social-clicks';
import { App } from './app';

describe('App', () => {
  afterEach(() => {
    // The page direction and saved choice live outside the component; reset them.
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
    localStorage.removeItem('language');
  });

  it('switches to Hebrew from the language dropdown', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTestTranslations()] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const navLabels = () => Array.from(el.querySelectorAll('ui-navbar .link')).map((a) => a.textContent!.trim());

    const trigger = el.querySelector<HTMLButtonElement>('ui-dropdown .trigger')!;
    expect(trigger.getAttribute('aria-label')).toContain('English');
    trigger.click();
    await fixture.whenStable();
    const hebrew = Array.from(el.querySelectorAll<HTMLElement>('ui-dropdown [role="option"]')).find((o) =>
      o.textContent!.includes('עברית'),
    )!;
    expect(hebrew.querySelector('img')!.getAttribute('src')).toBe('flags/il.svg');
    hebrew.click();
    await new Promise((resolve) => setTimeout(resolve)); // translations load
    await fixture.whenStable();

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he');
    expect(navLabels()).toEqual(['בית', 'עבודות', 'מי אני ?', 'צור קשר']);
    expect(el.querySelector('.resume a')!.textContent).toContain('הורדת קורות חיים');
    expect(localStorage.getItem('language')).toBe('he');
  });

  it('renders the header, navigation and footer', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTestTranslations()] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.brand')!.textContent).toContain('Alisa Zilberman');
    const navLinks = Array.from(el.querySelectorAll('ui-navbar .link')).map((a) => a.textContent!.trim());
    expect(navLinks).toEqual(['Home', 'Work', 'About Me', 'Contact']);
    expect(el.querySelector('.resume a')!.textContent).toContain('Download résumé');
    expect(el.querySelector('ui-footer')!.textContent).toContain('Alisa Zilberman');
    const github = SOCIAL_LINKS.find((s) => s.id === 'github')!;
    expect(el.querySelector('ui-footer .social[aria-label="GitHub"]')!.getAttribute('href')).toBe(github.href);
    expect(el.querySelector('ui-footer .social[aria-label="LinkedIn"]')).toBeNull();
  });

  it('shows the LinkedIn popup when a LinkedIn link is clicked', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTestTranslations()] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    // LinkedIn links live on the contact page now; click one through the shared handler
    const linkedIn = SOCIAL_LINKS.find((s) => s.id === 'linkedin')!;
    const click = new MouseEvent('click', { cancelable: true });
    TestBed.inject(SocialClicks).clicked(linkedIn, click);
    await fixture.whenStable();

    expect(click.defaultPrevented).toBe(true); // didn't navigate yet
    const dialog = el.querySelector('ui-dialog dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Yes. I have LinkedIn.');

    const buttons = Array.from(dialog.querySelectorAll('.actions a, .actions button'));
    expect(buttons.map((b) => b.textContent!.trim())).toEqual(['Talk work', 'LinkedIn, then']);
    expect(buttons[1].getAttribute('href')).toBe(linkedIn.href);
    expect(buttons[1].getAttribute('target')).toBe('_blank');
  });
});
