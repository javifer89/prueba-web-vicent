import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { EditorialContentService } from '../../core/services/editorial-content.service';

interface Event {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  year: string;
  description: string;
  place: string;
  city: string;
  country: string;
  program?: string;
  performers?: string;
  url?: string;
}

interface AgendaContent {
  upcoming: Event[];
  past: Event[];
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent implements OnInit {
  activeTab: 'upcoming' | 'past' = 'upcoming';
  agendaContent: AgendaContent | null = null;

  constructor(private editorialContentService: EditorialContentService) {}

  ngOnInit(): void {
    this.loadAgendaContent();
  }

  private loadAgendaContent(): void {
    this.editorialContentService.getLocalizedContent<AgendaContent>('agenda', 'events').subscribe(
      content => {
        this.agendaContent = content;
      }
    );
  }

  get upcomingEvents(): Event[] {
    return this.agendaContent?.upcoming || [];
  }

  get pastEvents(): Event[] {
    return this.agendaContent?.past || [];
  }
}