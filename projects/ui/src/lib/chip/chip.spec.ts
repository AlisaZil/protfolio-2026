import { TestBed } from '@angular/core/testing';
import { Chip, ChipConfig } from './chip';
import { ChipGroup, ChipGroupConfig } from './chip-group';

async function setupChip(config: ChipConfig) {
  const fixture = TestBed.createComponent(Chip);
  fixture.componentRef.setInput('config', config);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

async function setupGroup(config: ChipGroupConfig) {
  const fixture = TestBed.createComponent(ChipGroup);
  fixture.componentRef.setInput('config', config);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
  const pressed = () => buttons().map((b) => b.getAttribute('aria-pressed'));
  return { fixture, el, buttons, pressed };
}

const filters: ChipConfig[] = [
  { id: 'all', label: 'All' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'web', label: 'Web App' },
];

describe('Chip', () => {
  it('renders a tech chip as a plain label with its color', async () => {
    const { el } = await setupChip({ id: 'ng', label: 'Angular', color: 'pink' });
    expect(el.querySelector('button')).toBeNull();
    expect(el.textContent).toContain('Angular');
    expect(el.classList).toContain('chip--pink');
  });

  it('shows a logo before the label', async () => {
    const { el } = await setupChip({ id: 'ng', label: 'Angular', logo: 'M0 0h24v24H0z' });
    const path = el.querySelector('.label svg.logo path')!;
    expect(path.getAttribute('d')).toBe('M0 0h24v24H0z');
    expect(el.querySelector('.label')!.textContent!.trim()).toBe('Angular');
  });

  it('shows a multi-colour SVG logo before the label', async () => {
    const svg = '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#5b4fc4"/></svg>';
    const { el } = await setupChip({ id: 'ts', label: 'TypeScript', logoSvg: svg });
    expect(el.querySelector('.logo--svg svg rect')!.getAttribute('fill')).toBe('#5b4fc4');
  });

  it('toggles a standalone filter chip and emits selectedChange', async () => {
    const { fixture, el } = await setupChip({ id: 'all', label: 'All', kind: 'filter' });
    const spy = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(spy);

    el.querySelector('button')!.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith(true);
    expect(el.querySelector('button')!.getAttribute('aria-pressed')).toBe('true');
    expect(el.classList).toContain('is-selected');
  });

  it('emits removed from the remove button', async () => {
    const config: ChipConfig = { id: 'ng', label: 'Angular', removable: true };
    const { fixture, el } = await setupChip(config);
    const spy = vi.fn();
    fixture.componentInstance.removed.subscribe(spy);
    el.querySelector<HTMLButtonElement>('.remove')!.click();
    expect(spy).toHaveBeenCalledWith(config);
  });
});

describe('ChipGroup', () => {
  it('selects one chip at a time and emits the selection', async () => {
    const { fixture, buttons, pressed } = await setupGroup({ chips: filters, selectedIds: ['all'] });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);

    expect(pressed()).toEqual(['true', 'false', 'false']);
    buttons()[1].click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith(['enterprise']);
    expect(pressed()).toEqual(['false', 'true', 'false']);
  });

  it('keeps one chip selected unless allowEmpty is set', async () => {
    const { fixture, buttons, pressed } = await setupGroup({ chips: filters, selectedIds: ['all'] });
    buttons()[0].click();
    await fixture.whenStable();
    expect(pressed()[0]).toBe('true');
  });

  it('supports multiple selection', async () => {
    const { fixture, buttons } = await setupGroup({
      chips: filters,
      selectedIds: ['all'],
      multiple: true,
    });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);
    buttons()[2].click();
    expect(spy).toHaveBeenLastCalledWith(['all', 'web']);
  });
});
