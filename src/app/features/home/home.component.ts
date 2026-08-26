import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';
import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import useEmblaCarousel from 'embla-carousel';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

/** Raw shape of a `news.items` entry in the locale JSONs. */
interface RawNewsItem {
  slug: string;
  title: string;
  /** Category key matching `news.tabs.*` (not the translated label). */
  category: string;
  date: string;
  image: string;
}

/** News item as consumed by the template. */
interface NewsItem {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizedDatePipe, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('emblaRef', { static: false }) emblaRef!: ElementRef<HTMLElement>;

  private translationService = inject(TranslationService);

  private emblaApi: ReturnType<typeof useEmblaCarousel> | null = null;
  canScrollNext = false;

  /** Featured slugs selected from the shared `news.items` translations. */
  private readonly featuredSlugs = [
    'estreno-eternal-echoes-portugal',
    'estreno-mundial-resilience-eeuu',
    'presentacion-cd-gioia',
  ];

  /** Localized testimonials; falls back to an empty list until loaded. */
  get testimonials(): Testimonial[] {
    return this.translationService.getContent<Testimonial[]>('home.testimonials') ?? [];
  }

  /**
   * Single source of truth for news texts is `news.items` in the locale
   * JSONs (shared with NewsComponent); home only picks its three featured
   * slugs from it.
   */
  get featuredNews(): NewsItem[] {
    const items = this.translationService.getContent<RawNewsItem[]>('news.items') ?? [];
    return this.featuredSlugs
      .map(slug => items.find(item => item.slug === slug))
      .filter((item): item is RawNewsItem => !!item)
      .map(item => ({
        ...item,
        category: this.translationService.translate(`news.tabs.${item.category}`),
      }));
  }

  ngAfterViewInit(): void {
    this.initEmbla();
  }

  ngOnDestroy(): void {
    this.emblaApi?.destroy();
  }

  private initEmbla(): void {
    const emblaNode = this.emblaRef?.nativeElement;
    if (!emblaNode) return;

    this.emblaApi = useEmblaCarousel(emblaNode, { loop: false, align: 'start' });

    const updateBtnState = () => {
      if (this.emblaApi) {
        this.canScrollNext = this.emblaApi.canScrollNext();
      }
    };

    this.emblaApi.on('select', updateBtnState);
    this.emblaApi.on('init', updateBtnState);
    updateBtnState();
  }

  scrollNext(): void {
    this.emblaApi?.scrollNext();
  }
}
