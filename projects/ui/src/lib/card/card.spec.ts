import { TestBed } from '@angular/core/testing';
import { Card, CardConfig } from './card';

async function setup(config: CardConfig) {
  const fixture = TestBed.createComponent(Card);
  fixture.componentRef.setInput('config', config);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Card', () => {
  it('renders a project card', async () => {
    const { el } = await setup({
      variant: 'project',
      title: 'Bedazzle Studio',
      description: 'An interactive editor for decorating photos and invitations.',
      image: { src: '/bedazzle.png', alt: 'Bedazzle Studio home page' },
      tags: [
        { id: 'ng', label: 'Angular', color: 'pink' },
        { id: 'ts', label: 'TypeScript', color: 'lavender' },
      ],
      link: { label: 'View project', href: '/work/bedazzle', icon: 'arrow-right' },
    });
    expect(el.classList).toContain('card--project');
    expect(el.querySelector('h3')!.textContent).toBe('Bedazzle Studio');
    expect(el.querySelector('img')!.getAttribute('alt')).toBe('Bedazzle Studio home page');
    expect(el.querySelectorAll('ui-chip').length).toBe(2);
    expect(el.querySelector('ui-link a')!.getAttribute('href')).toBe('/work/bedazzle');
  });

  it('renders an experience card with "Present" when there is no end date', async () => {
    const { el } = await setup({
      variant: 'experience',
      company: 'Achdut Israel',
      role: 'Front-End Developer',
      period: { start: '2023' },
      description: 'Build and maintain accessible web applications with Angular.',
    });
    expect(el.querySelector('.period')!.textContent).toBe('2023 – Present');
    expect(el.querySelector('.company')!.textContent).toBe('Achdut Israel');
  });

  it('renders a skill card', async () => {
    const { el } = await setup({
      variant: 'skill',
      title: 'Front-End Development',
      skills: [
        { id: 'ng', label: 'Angular' },
        { id: 'rx', label: 'RxJS' },
        { id: 'scss', label: 'SCSS' },
      ],
    });
    expect(el.querySelector('.skill-title')!.textContent).toBe('Front-End Development');
    expect(el.querySelectorAll('ui-chip').length).toBe(3);
  });

  it('emits clicked for interactive cards, but not when the inner link is clicked', async () => {
    const { fixture, el } = await setup({
      variant: 'project',
      interactive: true,
      title: 'Bedazzle Studio',
      description: '…',
      link: { label: 'View project' },
    });
    const cardSpy = vi.fn();
    const linkSpy = vi.fn();
    fixture.componentInstance.clicked.subscribe(cardSpy);
    fixture.componentInstance.linkClicked.subscribe(linkSpy);

    expect(el.getAttribute('tabindex')).toBe('0');
    el.querySelector<HTMLButtonElement>('ui-link button')!.click();
    expect(linkSpy).toHaveBeenCalledOnce();
    expect(cardSpy).not.toHaveBeenCalled();

    el.querySelector<HTMLElement>('h3')!.click();
    expect(cardSpy).toHaveBeenCalledOnce();
  });
});
