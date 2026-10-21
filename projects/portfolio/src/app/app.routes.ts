import { Routes } from '@angular/router';

// Titles are translation keys (see public/translations.json and language/language.service.ts).
export const routes: Routes = [
  {
    path: '',
    title: 'titles.home',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'work',
    title: 'titles.work',
    loadComponent: () => import('./pages/work/work').then((m) => m.Work),
  },
  {
    path: 'about',
    title: 'titles.about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    title: 'titles.contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  // Unknown addresses go to the home page.
  { path: '**', redirectTo: '' },
];
