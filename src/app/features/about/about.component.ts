import { Component } from '@angular/core';
import { BiographyComponent } from '../biography/biography.component';
import { GalleryComponent } from '../gallery/gallery.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BiographyComponent, GalleryComponent],
  template: `
    <main class="about-page">
      <app-biography />
      <app-gallery />
    </main>
  `,
  styles: [
    `
      .about-page {
        // Separación entre biografía y galería
        app-biography {
          display: block;
        }

        app-gallery {
          display: block;
          padding-top: var(--space-2xl);
        }
      }
    `,
  ],
})
export class AboutComponent {}
