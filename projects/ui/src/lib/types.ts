export type IconName =
  | 'arrow-right'
  | 'arrow-down'
  | 'arrow-up-right'
  | 'external-link'
  | 'download'
  | 'chevron-down'
  | 'chevron-up'
  | 'sort'
  | 'more-vertical'
  | 'check'
  | 'close'
  | 'menu'
  | 'info'
  | 'alert'
  | 'database'
  | 'box'
  | 'zap'
  | 'brush'
  | 'file-text'
  | 'code'
  | 'smartphone'
  | 'image'
  | 'linkedin'
  | 'mail'
  | 'whatsapp'
  | 'github'
  | 'instagram'
  | 'dribbble';

export type RouterLinkCommands = string | readonly unknown[];

export interface NavItem {
  id: string;
  label: string;
  routerLink?: RouterLinkCommands;
  href?: string;
  exact?: boolean;
}
