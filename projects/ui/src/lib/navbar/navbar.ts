import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon, IconConfig } from '../icon/icon';
import { NavItem, RouterLinkCommands } from '../types';

export interface NavbarConfig {
  items: NavItem[];
  activeId?: string;
  brand?: { label: string; routerLink?: RouterLinkCommands; href?: string };
  collapseBelow?: number;
  ariaLabel?: string;
}

let nextId = 0;

@Component({
  selector: 'ui-navbar',
  imports: [Icon, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: {
    '[class.is-collapsed]': 'collapsed()',
    '(keydown.escape)': 'closeMenu()',
  },
})
export class Navbar {
  readonly config = input.required<NavbarConfig>();

  readonly itemSelected = output<NavItem>();
  /** Emits true when the mobile menu opens, false when it closes. */
  readonly menuToggled = output<boolean>();

  protected readonly listId = `ui-navbar-${nextId++}`;
  protected readonly collapsed = signal(false);
  protected readonly menuOpen = signal(false);

  protected readonly menuIcon = computed<IconConfig>(() => ({
    name: this.menuOpen() ? 'close' : 'menu',
    size: 24,
  }));

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    // Track the collapse breakpoint with a media query.
    effect((onCleanup) => {
      const breakpoint = this.config().collapseBelow ?? 768;
      if (!this.isBrowser || typeof matchMedia !== 'function') return;

      const query = matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
      const update = () => {
        this.collapsed.set(query.matches);
        if (!query.matches) this.closeMenu();
      };
      update();
      query.addEventListener('change', update);
      onCleanup(() => query.removeEventListener('change', update));
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.menuToggled.emit(this.menuOpen());
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuToggled.emit(false);
  }

  protected select(item: NavItem): void {
    this.itemSelected.emit(item);
    this.closeMenu();
  }
}
