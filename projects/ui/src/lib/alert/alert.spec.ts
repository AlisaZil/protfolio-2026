import { TestBed } from '@angular/core/testing';
import { Alert, AlertConfig } from './alert';
import { ToastContainer } from './toast-container';
import { ToastService } from './toast.service';

function setup(config: AlertConfig) {
  const fixture = TestBed.createComponent(Alert);
  fixture.componentRef.setInput('config', config);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Alert', () => {
  afterEach(() => vi.useRealTimers());

  it('renders title, message, tone and kind', () => {
    const { el } = setup({
      kind: 'toast',
      tone: 'success',
      title: 'Message sent!',
      message: "I'll get back to you soon.",
    });
    const alert = el.querySelector('.alert')!;
    expect(alert.classList).toContain('alert--toast');
    expect(alert.classList).toContain('alert--success');
    expect(alert.getAttribute('role')).toBe('status');
    expect(el.textContent).toContain('Message sent!');
  });

  it('uses role="alert" for errors', () => {
    const { el } = setup({ tone: 'error', message: 'Something went wrong' });
    expect(el.querySelector('.alert')!.getAttribute('role')).toBe('alert');
  });

  it('hides and emits dismissed from the close button', () => {
    const { fixture, el } = setup({ message: 'Saved', dismissible: true });
    const spy = vi.fn();
    fixture.componentInstance.dismissed.subscribe(spy);

    el.querySelector<HTMLButtonElement>('.close')!.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledOnce();
    expect(el.querySelector('.alert')).toBeNull();
  });

  it('dismisses itself after autoDismissMs', () => {
    vi.useFakeTimers();
    const { fixture, el } = setup({ message: 'Saved', autoDismissMs: 3000 });
    const spy = vi.fn();
    fixture.componentInstance.dismissed.subscribe(spy);

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledOnce();
    expect(el.querySelector('.alert')).toBeNull();
  });

  it('emits actionClicked', () => {
    const { fixture, el } = setup({ message: 'Deleted', action: { label: 'Undo' } });
    const spy = vi.fn();
    fixture.componentInstance.actionClicked.subscribe(spy);
    el.querySelector<HTMLButtonElement>('.action')!.click();
    expect(spy).toHaveBeenCalledOnce();
  });
});

describe('ToastService + ToastContainer', () => {
  it('shows and removes toasts', async () => {
    const fixture = TestBed.createComponent(ToastContainer);
    const service = TestBed.inject(ToastService);
    const el = fixture.nativeElement as HTMLElement;

    const id = service.show({ tone: 'success', message: 'Message sent!', autoDismissMs: 0 });
    await fixture.whenStable();
    expect(el.querySelectorAll('ui-alert').length).toBe(1);
    expect(el.querySelector('.alert--toast')).not.toBeNull();

    service.dismiss(id);
    await fixture.whenStable();
    expect(el.querySelectorAll('ui-alert').length).toBe(0);
  });
});
