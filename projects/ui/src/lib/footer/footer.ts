import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { IconName, NavItem } from '../types';

export interface FooterSocialLink {
  id: string;
  label: string;
  href: string;
  icon: IconName;
}

export interface FooterLinkClick {
  link: NavItem | FooterSocialLink;
  event: MouseEvent;
}

export interface FooterConfig {
  copyright: string;
  links?: NavItem[];
  status?: { label: string; available: boolean };
  socials?: FooterSocialLink[];
  variant?: 'boxed' | 'plain';
}

@Component({
  selector: 'ui-footer',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly config = input.required<FooterConfig>();

  /** Fires for page links and social links. */
  readonly linkClicked = output<FooterLinkClick>();
}
