/**
 * Projects shown on the Work page.
 *
 * The entries below are PLACEHOLDERS — replace them with your real projects.
 * To add a project, copy one entry and change its values. The order here is
 * the order on the page.
 */

export type ProjectCategory = 'enterprise' | 'web-app' | 'landing-page';

export interface Project {
  id: string;
  title: string;
  description?: string;
  category: ProjectCategory;
  image?: { src: string; alt: string };
  tech: string[];
  url?: string;
  linkLabel?: string;
}

/**
 * Filter buttons on the Work page, in order (an "All" button is added automatically).
 * Their names are translated in public/translations.json under "work.categories".
 */
export const PROJECT_CATEGORIES: ProjectCategory[] = ['enterprise', 'web-app', 'landing-page'];

export const PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'Project title',
    description: 'A short description of the project.',
    category: 'enterprise',
    tech: ['Angular', 'TypeScript', 'RxJS'],
    url: '',
  },
  {
    id: 'project-2',
    title: 'Project title',
    description: 'A short description of the project.',
    category: 'web-app',
    tech: ['Angular', 'TypeScript', 'SCSS'],
    url: '',
  },
  {
    id: 'project-3',
    title: 'Project title',
    description: 'A short description of the project.',
    category: 'landing-page',
    tech: ['HTML', 'CSS', 'JS'],
    url: '',
  },
  {
    id: 'project-4',
    title: 'Project title',
    description: 'A short description of the project.',
    category: 'web-app',
    tech: ['Angular', 'TypeScript'],
    url: '',
  },
  {
    id: 'project-5',
    title: 'Project title',
    description: 'A short description of the project.',
    category: 'landing-page',
    tech: ['HTML', 'SCSS', 'JS'],
    url: '',
  },
  {
    id: 'project-6',
    title: 'Project title',
    description: 'A short description of the project.',
    category: 'enterprise',
    tech: ['Angular', 'TypeScript', 'RxJS'],
    url: '',
  },
];
