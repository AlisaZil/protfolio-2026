import { TestBed } from '@angular/core/testing';
import { Cta } from './cta';

describe('Cta', () => {
  it('renders the copy and a large action button that emits actionClicked', async () => {
    const fixture = TestBed.createComponent(Cta);
    fixture.componentRef.setInput('config', {
      title: 'Let’s build something thoughtful.',
      text: 'Have a project in mind or just want to say hi?',
      action: { label: 'Get in touch', icon: 'arrow-right' },
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const spy = vi.fn();
    fixture.componentInstance.actionClicked.subscribe(spy);

    expect(el.querySelector('h2')!.textContent).toContain('Let’s build something thoughtful.');
    const button = el.querySelector('button')!;
    expect(button.classList).toContain('btn--lg');
    button.click();
    expect(spy).toHaveBeenCalledOnce();
  });
});
