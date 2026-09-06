import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { EditorialContentService } from '../../core/services/editorial-content.service';
import { HeroComponent } from '../public/hero/hero.component';

interface HomeContent {
  upcomingActivities: Array<{
    date: string;
    day: string;
    month: string;
    year: string;
    title: string;
    place: string;
  }>;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, HeroComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  homeContent: any = null;
  loading = true;

  private editorialContentService = inject(EditorialContentService);

  ngOnInit(): void {
    this.loadHomeContent();
  }

  private loadHomeContent(): void {
    this.editorialContentService.getLocalizedContent<any>('home', 'main').subscribe(
      content => {
        this.homeContent = content;
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }
}