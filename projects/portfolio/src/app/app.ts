import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  Button,
  ButtonConfig,
  Dialog,
  Dropdown,
  DropdownConfig,
  Footer,
  FooterConfig,
  NavItem,
  Navbar,
  NavbarConfig,
  ToastContainer,
} from 'ui';
import { LanguageService } from './language/language.service';
import { RESUME, SOCIAL_LINKS } from './profile';
import { SocialClicks } from './social-clicks';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Button, Dialog, Dropdown, Footer, ToastContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly socialClicks = inject(SocialClicks);
  protected readonly language = inject(LanguageService);

  private readonly pages = computed<NavItem[]>(() => [
    { id: 'work', label: this.language.t('nav.work'), routerLink: '/work' },
    { id: 'about', label: this.language.t('nav.about'), routerLink: '/about' },
    { id: 'contact', label: this.language.t('nav.contact'), routerLink: '/contact' },
  ]);

  protected readonly navbar = computed<NavbarConfig>(() => ({
    ariaLabel: this.language.t('nav.label'),
    brand: { label: this.language.t('nav.brand'), routerLink: '/' },
    items: [
      { id: 'home', label: this.language.t('nav.home'), routerLink: '/', exact: true },
      ...this.pages(),
    ],
  }));

  protected readonly languageDropdown = computed<DropdownConfig>(() => ({
    ariaLabel: this.language.t('header.language'),
    value: this.language.lang(),
    align: 'end',
    hideLabel: true,
    options: this.language.languages.map((l) => ({
      value: l.code,
      label: l.name,
      image: { src: l.flag },
    })),
  }));

  protected readonly resumeButton = computed<ButtonConfig>(() => ({
    label: this.language.t('header.resume'),
    variant: 'secondary',
    icon: 'download',
    iconPosition: 'start',
    href: RESUME.href,
    download: RESUME.fileName,
  }));

  protected readonly footer = computed<FooterConfig>(() => ({
    variant: 'plain',
    // The \u2066 and \u2069 marks keep this left-to-right on Hebrew pages (otherwise the year jumps to the end)
    copyright: `\u2066© ${new Date().getFullYear()} ${this.language.t('nav.brand')}\u2069`,
    links: this.pages(),
    socials: SOCIAL_LINKS.filter((s) => s.id === 'github'),
  }));
}
