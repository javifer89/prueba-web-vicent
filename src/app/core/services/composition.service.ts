import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { Composition, CompositionCategory, CompositionFile, Recording, Video, GalleryImage } from '../features/compositions/models/composition.model';

@Injectable({
  providedIn: 'root',
})
export class CompositionService {
  private dataUrl = '/assets/data/compositions.json';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Composition[]> {
    return this.http.get<Composition[]>(this.dataUrl).pipe(
      catchError(() => of(this.getMockData()))
    );
  }

  getBySlug(slug: string): Observable<Composition | undefined> {
    return this.getAll().pipe(
      map(compositions => compositions.find(c => c.slug === slug))
    );
  }

  getByCategory(category: CompositionCategory): Observable<Composition[]> {
    return this.getAll().pipe(
      map(compositions => compositions.filter(c => c.category === category))
    );
  }

  search(query: string): Observable<Composition[]> {
    return this.getAll().pipe(
      map(compositions => {
        const lowercaseQuery = query.toLowerCase();
        return compositions.filter(
          (c) =>
            c.title.toLowerCase().includes(lowercaseQuery) ||
            c.description.toLowerCase().includes(lowercaseQuery) ||
            c.instrumentation.toLowerCase().includes(lowercaseQuery)
        );
      })
    );
  }

  private getMockData(): Composition[] {
    return [
      {
        id: '1',
        slug: 'cuarteto-de-cuerdas-n1',
        title: 'Cuarteto de Cuerdas Nº 1',
        year: 2020,
        duration: '12:30',
        instrumentation: '2 violines, viola, cello',
        category: CompositionCategory.CHAMBER,
        description: 'Una obra en cuatro movimientos que explora la relación entre los cuatro instrumentos de cuerda. Encargada por el Cuarteto Quiroga.',
        premiere: {
          date: '2021-03-15',
          place: 'Auditorio Nacional',
          performers: ['Cuarteto Quiroga'],
          director: '',
          festival: 'Ciclo de Cámara'
        },
        files: [
          {
            name: 'Partitura completa.pdf',
            type: 'pdf',
            url: '/assets/pdfs/quarteto1-partitura.pdf',
            description: 'Partitura completa para cuarteto de cuerda'
          }
        ],
        recordings: [],
        videos: [],
        images: [],
        performers: [],
        notes: 'Estrenada por el Cuarteto Quiroga en el Auditorio Nacional de Madrid.'
      },
      {
        id: '2',
        slug: 'concierto-orquestal',
        title: 'Concierto Orquestal',
        year: 2022,
        duration: '25:00',
        instrumentation: 'Orquesta completa (3.3.3.3/4.3.3.1/timp+3perc/arp/cuerdas)',
        category: CompositionCategory.ORCHESTRA,
        description: 'Concierto para orquesta en un solo movimiento, encargo de la Filarmónica de Madrid. Explora texturas orquestales densas y momentos de gran transparencia.',
        premiere: {
          date: '2022-11-20',
          place: 'Teatro Real',
          performers: ['Orquesta Filarmónica de Madrid'],
          director: 'Pedro Halffter',
          festival: 'Temporada 2022-23'
        },
        files: [
          {
            name: 'Partitura orquestal.pdf',
            type: 'pdf',
            url: '/assets/pdfs/concierto-orquestal.pdf',
            description: 'Partitura para orquesta completa'
          }
        ],
        recordings: [],
        videos: [],
        images: [],
        performers: [],
        notes: 'Obra encargo de la Filarmónica de Madrid para su temporada 2022-23.'
      }
    ];
  }
}