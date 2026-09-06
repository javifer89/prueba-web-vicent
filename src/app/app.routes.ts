import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';
import { AdminNewsListComponent } from './features/admin/news/admin-news-list.component';
import { AdminNewsFormComponent } from './features/admin/news/admin-news-form.component';
import { AdminCategoriesListComponent } from './features/admin/categories/admin-categories-list.component';
import { AdminCategoriesFormComponent } from './features/admin/categories/admin-categories-form.component';
import { AdminEventsListComponent } from './features/admin/events/admin-events-list.component';
import { AdminEventsFormComponent } from './features/admin/events/admin-events-form.component';
import { AdminCompositionsListComponent } from './features/admin/compositions/admin-compositions-list.component';
import { AdminCompositionsFormComponent } from './features/admin/compositions/admin-compositions-form.component';
import { AdminMediaListComponent } from './features/admin/media/admin-media-list.component';
import { AdminMediaFormComponent } from './features/admin/media/admin-media-form.component';
import { AdminGalleriesListComponent } from './features/admin/galleries/admin-galleries-list.component';
import { AdminGalleriesFormComponent } from './features/admin/galleries/admin-galleries-form.component';
import { AdminBiographyFormComponent } from './features/admin/biography/admin-biography-form.component';
import { AdminSiteSettingsFormComponent } from './features/admin/site-settings/site-settings-admin-form.component';
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
      { path: 'categories', component: AdminCategoriesListComponent },
      { path: 'categories/new', component: AdminCategoriesFormComponent },
      { path: 'categories/:id/edit', component: AdminCategoriesFormComponent },
      { path: 'events', component: AdminEventsListComponent },
      { path: 'events/new', component: AdminEventsFormComponent },
      { path: 'events/:id/edit', component: AdminEventsFormComponent },
      { path: 'compositions', component: AdminCompositionsListComponent },
      { path: 'compositions/new', component: AdminCompositionsFormComponent },
      { path: 'compositions/:id/edit', component: AdminCompositionsFormComponent },
      { path: 'media', component: AdminMediaListComponent },
      { path: 'media/new', component: AdminMediaFormComponent },
      { path: 'media/:id/edit', component: AdminMediaFormComponent },
      { path: 'galleries', component: AdminGalleriesListComponent },
      { path: 'galleries/new', component: AdminGalleriesFormComponent },
      { path: 'galleries/:id/edit', component: AdminGalleriesFormComponent },
      { path: 'biography', component: AdminBiographyFormComponent },
      { path: 'settings', component: AdminSiteSettingsFormComponent },
    ],
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];