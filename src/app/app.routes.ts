import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'sobre-mi',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent),
  },
  // Redirects de rutas antiguas (biografia y galería ahora viven en /sobre-mi)
  {
    path: 'biografia',
    redirectTo: 'sobre-mi',
    pathMatch: 'full',
  },
  {
    path: 'galeria',
    redirectTo: 'sobre-mi',
    pathMatch: 'full',
  },
  {
    path: 'obras',
    loadComponent: () =>
      import('./features/compositions/list/composition-list.component').then(
        m => m.CompositionListComponent
      ),
  },
  {
    path: 'obras/:slug',
    loadComponent: () =>
      import('./features/compositions/detail/composition-detail.component').then(
        m => m.CompositionDetailComponent
      ),
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/agenda.component').then(m => m.AgendaComponent),
  },
  {
    path: 'multimedia',
    loadComponent: () =>
      import('./features/multimedia/multimedia.component').then(
        m => m.MultimediaComponent
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./features/contact/contact.component').then(
        m => m.ContactComponent
      ),
  },
  {
    path: 'noticias',
    loadComponent: () =>
      import('./features/news/news.component').then(m => m.NewsComponent),
  },
  {
    path: 'noticias/:slug',
    loadComponent: () =>
      import('./features/news/news.component').then(m => m.NewsComponent), // TODO: crear NewsDetailComponent
  },
  {
    path: 'politica-privacidad',
    loadComponent: () =>
      import('./features/legal/privacy-policy.component').then(
        m => m.PrivacyPolicyComponent
      ),
  },
  {
    path: 'uso-cookies',
    loadComponent: () =>
      import('./features/legal/cookie-policy.component').then(
        m => m.CookiePolicyComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
