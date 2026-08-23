import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CompositionListComponent } from './features/compositions/list/composition-list.component';
import { CompositionDetailComponent } from './features/compositions/detail/composition-detail.component';
import { BiographyComponent } from './features/biography/biography.component';
import { AgendaComponent } from './features/agenda/agenda.component';
import { MultimediaComponent } from './features/multimedia/multimedia.component';
import { GalleryComponent } from './features/gallery/gallery.component';
import { ContactComponent } from './features/contact/contact.component';

export const routes: Routes = [
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];