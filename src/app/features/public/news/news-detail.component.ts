import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, map, catchError, of, switchMap } from 'rxjs';
import { NewsService } from './news.service';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { News } from '../../../core/services/pocketbase/models';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss'],
})
export class NewsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private newsService = inject(NewsService);
  private pb = inject(PocketBaseService);
  private meta = inject(Meta);
  private title = inject(Title);

  loading = signal(true);
  error = signal<string | null>(null);
  news = signal<News | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('slug')),
      switchMap(slug => {
        this.loading.set(true);
        this.error.set(null);
        if (!slug) {
          return of(null);
        }
        return this.newsService.getBySlug(slug).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe(news => {
      if (news) {
        this.news.set(news);
        this.updateSeo(news);
      } else {
        this.error.set('notFound');
      }
      this.loading.set(false);
    });
  }

  private updateSeo(news: News): void {
    const seoTitle = this.newsService.getLocalizedSeoTitle(news);
    const seoDescription = this.newsService.getLocalizedSeoDescription(news);
    const fullTitle = seoTitle ? `${seoTitle} | Vicent Sellés Álamo` : 'Vicent Sellés Álamo';
    const coverUrl = this.newsService.getCoverUrl(news);

    this.title.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description', content: seoDescription });
    this.meta.updateTag({ property: 'og:title', content: seoTitle });
    this.meta.updateTag({ property: 'og:description', content: seoDescription });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    if (coverUrl) {
      this.meta.updateTag({ property: 'og:image', content: coverUrl });
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seoTitle });
    this.meta.updateTag({ name: 'twitter:description', content: seoDescription });
    if (coverUrl) {
      this.meta.updateTag({ name: 'twitter:image', content: coverUrl });
    }
    if (news.published_at) {
      this.meta.updateTag({ property: 'article:published_time', content: news.published_at });
    }
    if (news.category && typeof news.category === 'object') {
      this.meta.updateTag({ property: 'article:section', content: (news.category as any).name_ca });
    }
  }

  getCoverUrl(thumb?: string): string | null {
    const n = this.news();
    return n ? this.newsService.getCoverUrl(n, thumb) : null;
  }

  getLocalizedTitle(): string {
    const n = this.news();
    return n ? this.newsService.getLocalizedTitle(n) : '';
  }

  getLocalizedExcerpt(): string {
    const n = this.news();
    return n ? this.newsService.getLocalizedExcerpt(n) : '';
  }

  getLocalizedContent(): string {
    const n = this.news();
    return n ? this.newsService.getLocalizedContent(n) : '';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getCategoryName(): string {
    const n = this.news();
    if (!n?.category || typeof n.category === 'string') return '';
    return (n.category as any).name_ca || '';
  }

  goBack(): void {
    this.router.navigate(['/noticias']);
  }
}
