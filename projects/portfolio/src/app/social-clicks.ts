import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DialogCloseReason, DialogConfig } from 'ui';
import { LanguageService } from './language/language.service';

/**
 * Handles clicks on social links. LinkedIn gets a popup first ("Yes. I have LinkedIn.");
 * every other link opens as normal.
 *
 * The popup itself is rendered once, in the app shell (app.html).
 */
@Injectable({ providedIn: 'root' })
export class SocialClicks {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  private readonly linkedInUrl = signal<string | null>(null);

  readonly linkedInDialog = computed<DialogConfig>(() => ({
    open: this.linkedInUrl() !== null,
    icon: 'linkedin',
    size: 'large',
    title: this.language.t('linkedin.title'),
    message: this.language.t('linkedin.message'),
    actionsLayout: 'fill',
    confirmFirst: true,
    // "Talk work" → contact page
    confirm: { label: this.language.t('linkedin.contact'), icon: 'arrow-right', size: 'lg' },
    // "LinkedIn, then" → a real link, so the profile opens in a new tab
    cancel: {
      label: this.language.t('linkedin.open'),
      variant: 'neutral',
      icon: 'external-link',
      size: 'lg',
      href: this.linkedInUrl() ?? undefined,
      target: '_blank',
    },
  }));

  /** Call on click of any social link. */
  clicked(link: { id: string; href?: string }, event: Event): void {
    if (link.id !== 'linkedin' || !link.href) return;
    event.preventDefault(); // ask first
    this.linkedInUrl.set(link.href);
  }

  dialogClosed(reason: DialogCloseReason): void {
    this.linkedInUrl.set(null);
    if (reason === 'confirm') this.router.navigateByUrl('/contact');
  }
}
