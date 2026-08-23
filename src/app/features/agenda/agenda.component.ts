import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent {
  activeTab: 'upcoming' | 'past' = 'upcoming';

  upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Estreno de "Concierto Orquestal"',
      date: '2024-11-15',
      day: '15',
      month: 'NOV',
      year: '2024',
      description: 'Estreno absoluto del Concierto Orquestal, encargo de la Filarmónica de Madrid para su temporada 2024-25.',
      place: 'Teatro Real',
      city: 'Madrid',
      country: 'España',
      program: 'Concierto Orquestal (estreno) / Obras de R. Strauss y Mahler',
      performers: 'Orquesta Filarmónica de Madrid, Dir. Pedro Halffter',
      url: 'https://teatroral.es'
    },
    {
      id: '2',
      title: 'Concierto de Música de Cámara',
      date: '2024-12-03',
      day: '03',
      month: 'DIC',
      year: '2024',
      description: 'Programa monográfico de música de cámara con el Cuarteto Quiroga.',
      place: 'Auditorio Nacional de Música',
      city: 'Madrid',
      country: 'España',
      program: 'Cuarteto de Cuerdas Nº 1 / Cuarteto Nº 2 (estreno) / Obras de Bartók',
      performers: 'Cuarteto Quiroga',
      url: 'https://auditorionacional.mcu.es'
    },
    {
      id: '3',
      title: 'Festival Internacional de Música Contemporánea',
      date: '2025-02-20',
      day: '20',
      month: 'FEB',
      year: '2025',
      description: 'Participación en el Festival de Alicante con estreno de nueva obra para ensemble y electrónica.',
      place: 'ADDA - Auditorio de la Diputación de Alicante',
      city: 'Alicante',
      country: 'España',
      program: 'Nueva obra para ensemble y electrónica (estreno)',
      performers: 'Ensemble Taller Sonoro',
      url: 'https://festivalalicante.com'
    }
  ];

  pastEvents: Event[] = [
    {
      id: '4',
      title: 'Estreno de "Cuarteto de Cuerdas Nº 1"',
      date: '2021-03-15',
      day: '15',
      month: 'MAR',
      year: '2021',
      description: 'Estreno absoluto del Cuarteto de Cuerdas Nº 1 encargo del Cuarteto Quiroga.',
      place: 'Auditorio Nacional',
      city: 'Madrid',
      country: 'España',
      program: 'Cuarteto de Cuerdas Nº 1 / Obras de Beethoven y Berg',
      performers: 'Cuarteto Quiroga'
    },
    {
      id: '5',
      title: 'Residencia en Academia de España en Roma',
      date: '2017-06-10',
      day: '10',
      month: 'JUN',
      year: '2017',
      description: 'Concierto de clausura de la residencia con obras de cámara compuestas durante la estancia.',
      place: 'Academia de España en Roma',
      city: 'Roma',
      country: 'Italia',
      program: 'Obras de cámara (estrenos)',
      performers: 'Ensemble de la Academia'
    },
    {
      id: '6',
      title: 'Concierto en Philharmonie de Berlín',
      date: '2019-11-22',
      day: '22',
      month: 'NOV',
      year: '2019',
      description: 'Interpretación de obra orquestal en el ciclo de música contemporánea.',
      place: 'Philharmonie Berlin',
      city: 'Berlín',
      country: 'Alemania',
      program: 'Concierto para orquesta / Obras de Ligeti y Xenakis',
      performers: 'Ensemble Intercontemporain, Dir. Matthias Pintscher'
    }
  ];
}