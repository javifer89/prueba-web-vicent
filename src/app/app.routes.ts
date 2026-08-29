import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';
import { AdminNewsListComponent } from './features/admin/news/admin-news-list.component';
import { AdminNewsFormComponent } from './features/admin/news/admin-news-form.component';
import { adminAuthGuard, adminGuestGuard } from './core/services/admin-auth.guard';
import { HomeComponent } from './features/home/home.component';
import { CompositionListComponent } from './features/compositions/list/composition-list.component';
import { CompositionDetailComponent } from './features/compositions/detail/composition-detail.component';
import { BiographyComponent } from './features/biography/biography.component';
import { AgendaComponent } from './features/agenda/agenda.component';
import { MultimediaComponent } from './features/multimedia/multimedia.component';
import { GalleryComponent } from './features/gallery/gallery.component';
import { ContactComponent } from './features/contact/contact.component';
import { NewsListComponent } from './features/public/news/news-list.component';
import { NewsDetailComponent } from './features/public/news/news-detail.component';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'obras',
    component: CompositionListComponent,
  },
  {
    path: 'obras/:slug',
    component: CompositionDetailComponent,
  },
  {
    path: 'biografia',
    component: BiographyComponent,
  },
  {
    path: 'agenda',
    component: AgendaComponent,
  },
  {
    path: 'multimedia',
    component: MultimediaComponent,
  },
  {
    path: 'galeria',
    component: GalleryComponent,
  },
  {
    path: 'contacto',
    component: ContactComponent,
  },
  {
    path: 'noticias',
    component: NewsListComponent,
  },
  {
    path: 'noticias/:slug',
    component: NewsDetailComponent,
  },

  // Admin routes
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    canActivate: [adminGuestGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'news', pathMatch: 'full' },
      { path: 'news', component: AdminNewsListComponent },
      { path: 'news/new', component: AdminNewsFormComponent },
      { path: 'news/:id/edit', component: AdminNewsFormComponent },
      // TODO: Add other admin routes
      { path: 'events', component: AdminNewsListComponent }, // placeholder
      { path: 'compositions', component: AdminNewsListComponent }, // placeholder
      { path: 'media', component: AdminNewsListComponent }, // placeholder
      { path: 'galleries', component: AdminNewsListComponent }, // placeholder
      { path: 'biography', component: AdminNewsListComponent }, // placeholder
      { path: 'categories', component: AdminNewsListComponent }, // placeholder
      { path: 'settings', component: AdminNewsListComponent }, // placeholder
    ],
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];