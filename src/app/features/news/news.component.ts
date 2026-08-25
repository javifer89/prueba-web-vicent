import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';

interface NewsItem {
  slug: string;
  title: string;
  category: string;
  date: Date;
  image: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizedDatePipe, TranslatePipe],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  activeTab = 'todas';

  tabs = [
    { id: 'todas', label: 'news.tabs.todas' },
    { id: 'audiovisual', label: 'news.tabs.audiovisual' },
    { id: 'concert', label: 'news.tabs.concert' },
    { id: 'cursos', label: 'news.tabs.cursos' },
    { id: 'direccion', label: 'news.tabs.direccion' },
    { id: 'estrenos', label: 'news.tabs.estrenos' },
    { id: 'sin-categorizar', label: 'news.tabs.sinCategorizar' },
  ];

  allNews: NewsItem[] = [
    { slug: 'estreno-eternal-echoes-portugal', title: 'Estreno de Eternal Echoes en Portugal', category: 'Estrenos', date: new Date('2024-04-15'), image: 'https://images.unsplash.com/photo-1517665421576-ef4c10e0d7bd?w=800&q=80' },
    { slug: 'estreno-mundial-resilience-eeuu', title: 'Estreno mundial de Resilience en Estados Unidos', category: 'Estrenos', date: new Date('2024-04-10'), image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
    { slug: 'presentacion-cd-gioia', title: 'Presentación del CD Gioia', category: 'Audiovisual', date: new Date('2024-03-20'), image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
    { slug: 'primer-concierto-director-titular', title: 'Primer concierto de Vicent Egea como director titular de la Armónica de Buñol', category: 'Concierto', date: new Date('2024-03-15'), image: 'https://images.unsplash.com/photo-1517665421576-ef4c10e0d7bd?w=800&q=80' },
    { slug: 'nuevo-curso-composicion', title: 'Inicio de un nuevo curso de composición', category: 'Cursos', date: new Date('2024-02-20'), image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
    { slug: 'il-campanello-opera', title: 'Il Campanello ópera', category: 'Dirección', date: new Date('2024-02-10'), image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
    { slug: 'estreno-leonardo-dreams', title: 'Estreno de Leonardo Dreams', category: 'Estrenos', date: new Date('2024-01-25'), image: 'https://images.unsplash.com/photo-1517665421576-ef4c10e0d7bd?w=800&q=80' },
    { slug: 'estreno-apocriphos-vancouver', title: 'Estreno de Apocriphos en la British Columbia de Vancouver', category: 'Sin categorizar', date: new Date('2024-01-10'), image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
    { slug: 'homenaje-lliria', title: 'Homenaje en Llíria y estrenos con la Orquesta del Principado de Asturias', category: 'Concierto', date: new Date('2023-12-20'), image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
    { slug: 'bso-cocktailbrothers', title: 'Vicent Egea compondrá la BSO de Cocktail&Brothers', category: 'Audiovisual', date: new Date('2023-12-05'), image: 'https://images.unsplash.com/photo-1517665421576-ef4c10e0d7bd?w=800&q=80' },
  ];

  filteredNews: NewsItem[] = [];

  ngOnInit(): void {
    this.filterNews();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.filterNews();
  }

  private filterNews(): void {
    if (this.activeTab === 'todas') {
      this.filteredNews = [...this.allNews];
    } else {
      this.filteredNews = this.allNews.filter(news => news.category.toLowerCase() === this.activeTab);
    }
  }

  get featuredNews(): NewsItem {
    return this.filteredNews[0];
  }

  get secondaryNews(): NewsItem[] {
    return this.filteredNews.slice(1, 3);
  }

  get remainingNews(): NewsItem[] {
    return this.filteredNews.slice(3);
  }
}