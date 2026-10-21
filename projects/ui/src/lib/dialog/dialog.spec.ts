import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog, DialogCloseReason } from './dialog';

@Component({
  imports: [Dialog],
  template: `
    <ui-dialog
      [config]="{ open: open(), title: 'Are you sure?', message: 'This action cannot be undone.' }"
      (opened)="opened()"
      (confirmed)="confirmed()"
      (cancelled)="cancelled($event)"
      (closed)="onClosed($event)"
    />
  `,
})
class Host {
  open = signal(false);
  opened = vi.fn();
  confirmed = vi.fn();
  cancelled = vi.fn<(reason: DialogCloseReason) => void>();
  closed = vi.fn<(reason: DialogCloseReason) => void>();

  onClosed(reason: DialogCloseReason) {
    this.closed(reason);
    this.open.set(false);
  }
}

/** Lets the native `close` event (fired asynchronously) arrive. */
const nextTask = () => new Promise((resolve) => setTimeout(resolve));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;

  host.open.set(true);
  await fixture.whenStable();

  const dialog = el.querySelector('dialog')!;
  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('.actions button'));
  return { fixture, el, host, dialog, cancel: buttons[0], confirm: buttons[1] };
}

describe('Dialog', () => {
  it('opens from config and renders title and message', async () => {
    const { host, dialog } = await setup();
    expect(dialog.open).toBe(true);
    expect(host.opened).toHaveBeenCalledOnce();
    expect(dialog.textContent).toContain('Are you sure?');
    expect(dialog.textContent).toContain('This action cannot be undone.');
  });

  it('emits confirmed and closed("confirm") from the confirm button', async () => {
    const { fixture, host, dialog, confirm } = await setup();
    confirm.click();
    await nextTask();
    await fixture.whenStable();

    expect(host.confirmed).toHaveBeenCalledOnce();
    expect(host.closed).toHaveBeenCalledWith('confirm');
    expect(host.cancelled).not.toHaveBeenCalled();
    expect(dialog.open).toBe(false);
  });

  it('emits cancelled("cancel") from the cancel button', async () => {
    const { host, cancel } = await setup();
    cancel.click();
    await nextTask();
    expect(host.cancelled).toHaveBeenCalledWith('cancel');
    expect(host.closed).toHaveBeenCalledWith('cancel');
  });

  it('closes on backdrop click', async () => {
    const { host, dialog } = await setup();
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTask();
    expect(host.closed).toHaveBeenCalledWith('backdrop');
  });

  it('closes on Escape', async () => {
    const { host, dialog } = await setup();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await nextTask();
    expect(host.closed).toHaveBeenCalledWith('escape');
  });

  it('closes silently when config.open turns false', async () => {
    const { fixture, host, dialog } = await setup();
    host.open.set(false);
    await fixture.whenStable();
    await nextTask();
    expect(dialog.open).toBe(false);
    expect(host.closed).not.toHaveBeenCalled();
  });
});

describe('Dialog layout options', () => {
  it('shows an icon above the title and can put confirm first in a full-width row', async () => {
    const fixture = TestBed.createComponent(Dialog);
    fixture.componentRef.setInput('config', {
      open: true,
      icon: 'linkedin',
      size: 'large',
      title: 'Yes. I have LinkedIn.',
      message: 'Line one.\nLine two.',
      actionsLayout: 'fill',
      confirmFirst: true,
      confirm: { label: 'Talk work' },
      cancel: { label: 'LinkedIn, then' },
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('dialog')!.classList).toContain('dialog--large');
    expect(el.querySelector('.badge ui-icon')).not.toBeNull();
    expect(el.querySelector('.title--below')!.textContent).toContain('Yes. I have LinkedIn.');
    expect(el.querySelector('.actions')!.classList).toContain('actions--fill');

    const labels = Array.from(el.querySelectorAll('.actions button')).map((b) => b.textContent!.trim());
    expect(labels).toEqual(['Talk work', 'LinkedIn, then']);
    expect(el.querySelectorAll('.actions ui-button.full-width').length).toBe(2);
  });
});

describe('Dialog intro animation', () => {
  afterEach(() => vi.useRealTimers());

  it('types the title, then reveals the message and buttons', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(Dialog);
    fixture.componentRef.setInput('config', {
      open: true,
      icon: 'linkedin',
      introAnimation: true,
      title: 'Hello there',
      message: 'Some text',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const visibleTitle = () => el.querySelector('.title [aria-hidden="true"]')!.textContent!.trim();
    const panel = el.querySelector('.panel')!;

    // Screen readers get the full title straight away
    expect(el.querySelector('.title .visually-hidden')!.textContent).toBe('Hello there');
    expect(visibleTitle()).toBe('');
    expect(panel.classList).toContain('is-waiting');

    vi.advanceTimersByTime(45 * 5);
    fixture.detectChanges();
    expect(visibleTitle()).toBe('Hello');
    expect(el.querySelector('.caret')).not.toBeNull();

    vi.advanceTimersByTime(45 * 10);
    fixture.detectChanges();
    expect(visibleTitle()).toBe('Hello there');
    expect(el.querySelector('.caret')).toBeNull();
    expect(panel.classList).not.toContain('is-waiting');
  });
});
