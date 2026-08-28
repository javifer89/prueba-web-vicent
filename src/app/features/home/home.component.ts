import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { EditorialContentService } from '../../core/services/editorial-content.service';

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
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  homeContent: HomeContent | null = null;

  constructor(private editorialContentService: EditorialContentService) {}

  ngOnInit(): void {
    this.loadHomeContent();
  }

  private loadHomeContent(): void {
    this.editorialContentService.getLocalizedContent<HomeContent>('home', 'main').subscribe(
      content => {
        this.homeContent = content;
      }
    );
  }
}