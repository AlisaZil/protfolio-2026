import { IconName } from 'ui';

export const PROFILE = {
  name: 'Alisa Zilberman',
  email: 'AlisaZilberman@gmail.com',
  available: true,
};

export const RESUME = {
  href: 'files/CV-Alisa-2026.pdf',
  fileName: 'Alisa Zilberman - CV 2026.pdf',
};

export const CURRENT_ROLE = {
  start: '2023',
  tech: ['Angular', 'TypeScript', 'SCSS'],
};

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: IconName;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/AlisaZil', icon: 'github' },
];
