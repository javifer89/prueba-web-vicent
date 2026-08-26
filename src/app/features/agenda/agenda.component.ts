import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

/** Localized texts for an event, keyed by event id under `agenda.events`. */
interface EventTexts {
  title: string;
  description: string;
  month: string;
  program: string;
}

/** Non-textual event data (dates and logistics) kept in TS. */
interface EventMeta {
  id: string;
  date: string;
  day: string;
  year: string;
  place: string;
  city: string;
  country: string;
  performers?: string;
  url?: string;
}

/** Event as consumed by the template (same binding names as before). */
type Event = EventMeta & Partial<EventTexts>;

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent {
  private translationService = inject(TranslationService);

  activeTab: 'upcoming' | 'past' = 'upcoming';

  private readonly upcomingMeta: EventMeta[] = [
    {
      id: '1',
      date: '2024-11-15',
      day: '15',
      year: '2024',
      place: 'Teatro Real',
      city: 'Madrid',
      country: 'España',
      performers: 'Orquesta Filarmónica de Madrid, Dir. Pedro Halffter',
      url: 'https://teatroral.es'
    },
    {
      id: '2',
      date: '2024-12-03',
      day: '03',
      year: '2024',
      place: 'Auditorio Nacional de Música',
      city: 'Madrid',
      country: 'España',
      performers: 'Cuarteto Quiroga',
      url: 'https://auditorionacional.mcu.es'
    },
    {
      id: '3',
      date: '2025-02-20',
      day: '20',
      year: '2025',
      place: 'ADDA - Auditorio de la Diputación de Alicante',
      city: 'Alicante',
      country: 'España',
      performers: 'Ensemble Taller Sonoro',
      url: 'https://festivalalicante.com'
    }
  ];

  private readonly pastMeta: EventMeta[] = [
    {
      id: '4',
      date: '2021-03-15',
      day: '15',
      year: '2021',
      place: 'Auditorio Nacional',
      city: 'Madrid',
      country: 'España',
      performers: 'Cuarteto Quiroga'
    },
    {
      id: '5',
      date: '2017-06-10',
      day: '10',
      year: '2017',
      place: 'Academia de España en Roma',
      city: 'Roma',
      country: 'Italia',
      performers: 'Ensemble de la Academia'
    },
    {
      id: '6',
      date: '2019-11-22',
      day: '22',
      year: '2019',
      place: 'Philharmonie Berlin',
      city: 'Berlín',
      country: 'Alemania',
      performers: 'Ensemble Intercontemporain, Dir. Matthias Pintscher'
    }
  ];

  get upcomingEvents(): Event[] {
    return this.withTexts(this.upcomingMeta);
  }

  get pastEvents(): Event[] {
    return this.withTexts(this.pastMeta);
  }

  /** Merges each event's logistics with its localized texts from `agenda.events`. */
  private withTexts(meta: EventMeta[]): Event[] {
    const events = this.translationService.getContent<Record<string, EventTexts>>('agenda.events') ?? {};
    return meta.map(m => ({ ...m, ...(events[m.id] ?? {}) }));
  }
}
