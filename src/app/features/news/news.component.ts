import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';
import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';

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
  categoryKey: string;
  date: string;
  image: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizedDatePipe, TranslatePipe],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
  private translationService = inject(TranslationService);

  // Tab ids double as `news.items[].category` keys so filtering works in
  // every locale regardless of the translated label text.
  activeTab = 'todas';

  tabs = [
    { id: 'todas', label: 'news.tabs.todas' },
    { id: 'audiovisual', label: 'news.tabs.audiovisual' },
    { id: 'concert', label: 'news.tabs.concert' },
    { id: 'cursos', label: 'news.tabs.cursos' },
    { id: 'direccion', label: 'news.tabs.direccion' },
    { id: 'estrenos', label: 'news.tabs.estrenos' },
    { id: 'sinCategorizar', label: 'news.tabs.sinCategorizar' },
  ];

  /**
   * Single source of truth shared with HomeComponent: the localized
   * `news.items` array. Category labels are resolved through the existing
   * `news.tabs.*` translations.
   */
  get allNews(): NewsItem[] {
    const items = this.translationService.getContent<RawNewsItem[]>('news.items') ?? [];
    return items.map(item => ({
      ...item,
      categoryKey: item.category,
      category: this.translationService.translate(`news.tabs.${item.category}`),
    }));
  }

  get filteredNews(): NewsItem[] {
    if (this.activeTab === 'todas') {
      return [...this.allNews];
    }
    return this.allNews.filter(news => news.categoryKey === this.activeTab);
  }

  get featuredNews(): NewsItem | undefined {
    return this.filteredNews[0];
  }

  get secondaryNews(): NewsItem[] {
    return this.filteredNews.slice(1, 3);
  }

  get remainingNews(): NewsItem[] {
    return this.filteredNews.slice(3);
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
