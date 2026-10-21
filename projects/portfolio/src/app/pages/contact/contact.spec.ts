import { TestBed } from '@angular/core/testing';
import { PROFILE, SOCIAL_LINKS } from '../../profile';
import { provideTestTranslations } from '../../../testing/translations';
import { Contact } from './contact';
import { SocialClicks } from '../../social-clicks';
import { ContactService } from './contact.service';

async function setup() {
  const send = vi.fn().mockResolvedValue(undefined);
  TestBed.configureTestingModule({
    providers: [{ provide: ContactService, useValue: { send } }, provideTestTranslations()],
  });
  const fixture = TestBed.createComponent(Contact);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;

  const field = (selector: string) => el.querySelector<HTMLInputElement>(selector)!;
  const type = (selector: string, value: string) => {
    const input = field(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };
  const errors = () => Array.from(el.querySelectorAll('.error')).map((e) => e.textContent!.trim());

  return { fixture, el, send, field, type, submit, errors };
}

describe('Contact', () => {
  it('shows the contact details and social links', async () => {
    const { el } = await setup();
    expect(el.querySelector('h1')!.textContent).toContain('Have something in mind?');
    expect(el.querySelector('.availability')!.textContent).toContain('Open to freelance projects');
    expect(el.querySelector(`a[href="mailto:${PROFILE.email}"]`)).not.toBeNull();
    expect(el.querySelectorAll('.social').length).toBe(SOCIAL_LINKS.length);
  });

  it('asks before opening LinkedIn, but not for other links', async () => {
    const { el } = await setup();
    const socialClicks = TestBed.inject(SocialClicks);
    const link = (label: string) => el.querySelector<HTMLAnchorElement>(`.social[aria-label="${label}"]`)!;
    const click = (label: string) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      el.addEventListener('click', (e) => e.preventDefault(), { once: true }); // stay on the test page
      link(label).dispatchEvent(event);
    };

    click('GitHub');
    expect(socialClicks.linkedInDialog().open).toBe(false);

    click('LinkedIn');
    const dialog = socialClicks.linkedInDialog();
    expect(dialog.open).toBe(true);
    expect(dialog.cancel?.href).toBe(link('LinkedIn').getAttribute('href'));
    expect(dialog.cancel?.target).toBe('_blank');
  });

  it('shows errors and does not send when the form is empty', async () => {
    const { send, submit, errors } = await setup();
    await submit();
    expect(errors()).toEqual([
      'Please enter your name',
      'Please enter your email',
      'Please tell me a little about your project',
    ]);
    expect(send).not.toHaveBeenCalled();
  });

  it('shows an error and keeps the message when sending fails', async () => {
    const { el, send, field, type, submit } = await setup();
    send.mockRejectedValue(new Error('offline'));
    type('input[type="text"]', 'Dana');
    type('input[type="email"]', 'dana@example.com');
    type('textarea', 'I need a dashboard for my team.');
    await submit();
    await new Promise((resolve) => setTimeout(resolve));

    expect(el.querySelector('.alert--error')!.textContent).toContain('AlisaZilberman@gmail.com');
    expect(field('input[type="text"]').value).toBe('Dana');
  });

  it('flags an invalid email', async () => {
    const { type, submit, errors } = await setup();
    type('input[type="text"]', 'Dana');
    type('input[type="email"]', 'dana@');
    type('textarea', 'I need a dashboard for my team.');
    await submit();
    expect(errors()).toEqual(['Enter a valid email']);
  });

  it('sends a valid message, thanks the sender and clears the form', async () => {
    const { el, send, field, type, submit, errors } = await setup();
    type('input[type="text"]', 'Dana');
    type('input[type="email"]', 'dana@example.com');
    type('textarea', 'I need a dashboard for my team.');
    await submit();

    expect(send).toHaveBeenCalledWith({
      name: 'Dana',
      email: 'dana@example.com',
      message: 'I need a dashboard for my team.',
    });
    expect(errors()).toEqual([]);
    expect(el.querySelector('ui-alert')!.textContent).toContain('Thanks, Dana!');
    expect(el.querySelector('ui-alert')!.textContent).toContain('Your message is on its way');
    expect(field('input[type="text"]').value).toBe('');
  });
});
