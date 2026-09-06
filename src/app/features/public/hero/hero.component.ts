import { Component, OnDestroy, signal, viewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnDestroy {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private rafId: number | null = null;
  private heroSection = viewChild<ElementRef<HTMLElement>>('heroSection');

  // Imágenes directas desde ImageKit CDN
  readonly heroImageUrls = [
    'https://ik.imagekit.io/javiferdev/VICENT/VICENT-164%20copia.jpg?updatedAt=1787689026974',
    //'https://ik.imagekit.io/javiferdev/VICENT/VICENT-103.jpg?updatedAt=1787689025023',
    //'https://ik.imagekit.io/javiferdev/VICENT/VICENT-30.jpg?updatedAt=1787689024686',
    //'https://ik.imagekit.io/javiferdev/VICENT/VICENT-86.jpg?updatedAt=1787689024775',
  ];

  readonly heroImageTitles = [
    'VICENT 103',
    'VICENT 30',
    'VICENT 86',
  ];

  // Parallax speeds per layer (0 = fixed, 1 = normal scroll, >1 = faster)
  readonly parallaxSpeeds = [0.15, 0.25, 0.35];

  // Base scale for parallax buffer (prevents edge gaps during movement)
  readonly baseScale = 1.15;
  // Hover scale multiplier
  readonly hoverScale = 1.18;

  // Signals for reactive state
  readonly parallaxOffsets = signal<number[]>([0, 0, 0]);
  readonly hoveredIndex = signal<number | null>(null);

  loading = false;
  error: string | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParallax();
    }
  }

  private initParallax(): void {
    const updateParallax = (): void => {
      const section = this.heroSection()?.nativeElement;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = this.document.defaultView?.innerHeight ?? 0;

      // Solo aplicar parallax mientras el hero está en viewport
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        this.rafId = requestAnimationFrame(updateParallax);
        return;
      }

      // Progreso del scroll a través del hero (0 a 1)
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      const maxOffset = rect.height * 0.3; // Máximo 30% de la altura

      const newOffsets = this.parallaxSpeeds.map((speed) => progress * maxOffset * speed);
      this.parallaxOffsets.set(newOffsets);
      this.rafId = requestAnimationFrame(updateParallax);
    };

    this.rafId = requestAnimationFrame(updateParallax);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('[Hero] Image loaded:', img.src);
    img.classList.add('loaded');
  }

  onImageError(event: Event, index: number): void {
    const img = event.target as HTMLImageElement;
    console.error('[Hero] Image error at index', index, 'src:', img.src, 'event:', event);
    img.alt = `Error cargando ${this.heroImageTitles[index] || 'imagen hero'}`;
    img.classList.add('loaded');
  }

  onMouseEnter(index: number): void {
    this.hoveredIndex.set(index);
  }

  onMouseLeave(): void {
    this.hoveredIndex.set(null);
  }

  getTransform(index: number): string {
    const offset = this.parallaxOffsets()[index] ?? 0;
    const isHovered = this.hoveredIndex() === index;
    const scale = isHovered ? this.hoverScale : this.baseScale;
    return `translateY(${offset}px) scale(${scale})`;
  }
}
