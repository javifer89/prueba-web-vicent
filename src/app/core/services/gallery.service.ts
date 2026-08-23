import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GalleryImage, MediaType } from '../../features/compositions/models/composition.model';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  // TODO: Replace with real media from your assets
  // Images: src/assets/images/gallery/
  // Videos: src/assets/videos/gallery/ or external URLs
  // Audios: src/assets/audio/gallery/ or external URLs
  private readonly mockMedia: GalleryImage[] = [
    // ========== IMÁGENES ==========
    // Retratos
    {
      id: 'portrait-1',
      type: 'image',
      url: '/assets/images/gallery/portrait-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/portrait-1.jpg',
      description: 'Retrato oficial 2024',
      category: 'retratos',
      date: '2024-01-15',
    },
    {
      id: 'portrait-2',
      type: 'image',
      url: '/assets/images/gallery/portrait-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/portrait-2.jpg',
      description: 'Sesión de fotos en estudio',
      category: 'retratos',
      date: '2023-06-20',
    },
    {
      id: 'portrait-3',
      type: 'image',
      url: '/assets/images/gallery/portrait-3.jpg',
      thumbnail: '/assets/images/gallery/thumbs/portrait-3.jpg',
      description: 'Retrato para programa de mano',
      category: 'retratos',
      date: '2022-11-10',
    },

    // Conciertos (imágenes)
    {
      id: 'concert-img-1',
      type: 'image',
      url: '/assets/images/gallery/concert-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/concert-1.jpg',
      description: 'Concierto en el Auditorio Nacional',
      category: 'conciertos',
      date: '2024-03-15',
    },
    {
      id: 'concert-img-2',
      type: 'image',
      url: '/assets/images/gallery/concert-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/concert-2.jpg',
      description: 'Ensayo con la Orquesta Filarmónica',
      category: 'conciertos',
      date: '2024-02-28',
    },
    {
      id: 'concert-img-3',
      type: 'image',
      url: '/assets/images/gallery/concert-3.jpg',
      thumbnail: '/assets/images/gallery/thumbs/concert-3.jpg',
      description: 'Recital de cámara en Barcelona',
      category: 'conciertos',
      date: '2023-11-05',
    },
    {
      id: 'concert-img-4',
      type: 'image',
      url: '/assets/images/gallery/concert-4.jpg',
      thumbnail: '/assets/images/gallery/thumbs/concert-4.jpg',
      description: 'Concierto al aire libre - Festival de Verano',
      category: 'conciertos',
      date: '2023-07-20',
    },

    // Estrenos (imágenes)
    {
      id: 'premiere-img-1',
      type: 'image',
      url: '/assets/images/gallery/premiere-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/premiere-1.jpg',
      description: 'Estreno "Concierto Orquestal" - Teatro Real',
      category: 'estrenos',
      date: '2024-11-15',
    },
    {
      id: 'premiere-img-2',
      type: 'image',
      url: '/assets/images/gallery/premiere-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/premiere-2.jpg',
      description: 'Estreno "Cuarteto Nº 2" - Auditorio Nacional',
      category: 'estrenos',
      date: '2024-12-03',
    },
    {
      id: 'premiere-img-3',
      type: 'image',
      url: '/assets/images/gallery/premiere-3.jpg',
      thumbnail: '/assets/images/gallery/thumbs/premiere-3.jpg',
      description: 'Estreno obra electrónica - Festival Alicante',
      category: 'estrenos',
      date: '2025-02-20',
    },

    // Ensayos (imágenes)
    {
      id: 'rehearsal-img-1',
      type: 'image',
      url: '/assets/images/gallery/rehearsal-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/rehearsal-1.jpg',
      description: 'Ensayos con Cuarteto Quiroga',
      category: 'ensayos',
      date: '2024-01-20',
    },
    {
      id: 'rehearsal-img-2',
      type: 'image',
      url: '/assets/images/gallery/rehearsal-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/rehearsal-2.jpg',
      description: 'Sesión de trabajo con ensemble',
      category: 'ensayos',
      date: '2023-09-12',
    },

    // Festivales (imágenes)
    {
      id: 'festival-img-1',
      type: 'image',
      url: '/assets/images/gallery/festival-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/festival-1.jpg',
      description: 'Festival de Música Contemporánea de Alicante',
      category: 'festivales',
      date: '2024-09-15',
    },
    {
      id: 'festival-img-2',
      type: 'image',
      url: '/assets/images/gallery/festival-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/festival-2.jpg',
      description: 'Residencia en ZKM Karlsruhe',
      category: 'festivales',
      date: '2023-05-10',
    },
    {
      id: 'festival-img-3',
      type: 'image',
      url: '/assets/images/gallery/festival-3.jpg',
      thumbnail: '/assets/images/gallery/thumbs/festival-3.jpg',
      description: 'Academia de España en Roma',
      category: 'festivales',
      date: '2017-06-10',
    },

    // Prensa (imágenes)
    {
      id: 'press-img-1',
      type: 'image',
      url: '/assets/images/gallery/press-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/press-1.jpg',
      description: 'Entrevista en Revista Scherzo',
      category: 'prensa',
      date: '2024-10-01',
    },
    {
      id: 'press-img-2',
      type: 'image',
      url: '/assets/images/gallery/press-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/press-2.jpg',
      description: 'Artículo en El País Cultural',
      category: 'prensa',
      date: '2023-12-15',
    },

    // Otros (imágenes)
    {
      id: 'other-img-1',
      type: 'image',
      url: '/assets/images/gallery/other-1.jpg',
      thumbnail: '/assets/images/gallery/thumbs/other-1.jpg',
      description: 'Trabajo en estudio con electrónica',
      category: 'otros',
      date: '2024-04-05',
    },
    {
      id: 'other-img-2',
      type: 'image',
      url: '/assets/images/gallery/other-2.jpg',
      thumbnail: '/assets/images/gallery/thumbs/other-2.jpg',
      description: 'Masterclass en Conservatorio Superior',
      category: 'otros',
      date: '2024-03-01',
    },

    // ========== VIDEOS ==========
    // Conciertos (videos)
    {
      id: 'concert-vid-1',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Concierto completo - Auditorio Nacional 2024',
      category: 'directos',
      date: '2024-03-15',
      platform: 'youtube',
      duration: '1:45:30',
    },
    {
      id: 'concert-vid-2',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Ensayo abierto con Orquesta Filarmónica',
      category: 'directos',
      date: '2024-02-28',
      platform: 'youtube',
      duration: '2:15:00',
    },
    {
      id: 'concert-vid-3',
      type: 'video',
      url: 'https://player.vimeo.com/video/123456789',
      thumbnail: 'https://i.vimeocdn.com/video/123456789.webp',
      description: 'Recital de cámara - Barcelona',
      category: 'grabaciones',
      date: '2023-11-05',
      platform: 'vimeo',
      duration: '45:20',
    },

    // Estrenos (videos)
    {
      id: 'premiere-vid-1',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Estreno "Concierto Orquestal" - Teatro Real',
      category: 'estrenos-video',
      date: '2024-11-15',
      platform: 'youtube',
      duration: '35:40',
    },
    {
      id: 'premiere-vid-2',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Estreno "Cuarteto Nº 2" - Auditorio Nacional',
      category: 'estrenos-video',
      date: '2024-12-03',
      platform: 'youtube',
      duration: '28:15',
    },

    // Documentales / Entrevistas (videos)
    {
      id: 'docu-vid-1',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Documental: Proceso compositivo',
      category: 'documentales',
      date: '2024-10-01',
      platform: 'youtube',
      duration: '22:30',
    },
    {
      id: 'docu-vid-2',
      type: 'video',
      url: 'https://player.vimeo.com/video/987654321',
      thumbnail: 'https://i.vimeocdn.com/video/987654321.webp',
      description: 'Entrevista: Música y tecnología',
      category: 'documentales',
      date: '2023-12-15',
      platform: 'vimeo',
      duration: '18:45',
    },

    // Masterclasses (videos)
    {
      id: 'master-vid-1',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Masterclass: Composición contemporánea',
      category: 'masterclasses',
      date: '2024-03-01',
      platform: 'youtube',
      duration: '1:30:00',
    },

    // ========== AUDIOS ==========
    // Grabaciones de conciertos
    {
      id: 'concert-aud-1',
      type: 'audio',
      url: 'https://example.com/audio/concierto-orquestal.mp3',
      thumbnail: '/assets/images/gallery/thumbs/audio-concert.jpg',
      description: 'Concierto Orquestal - Grabación completa',
      category: 'grabaciones',
      date: '2024-11-15',
      audioUrl: 'https://example.com/audio/concierto-orquestal.mp3',
      duration: '35:40',
    },
    {
      id: 'concert-aud-2',
      type: 'audio',
      url: 'https://example.com/audio/cuarteto1.mp3',
      thumbnail: '/assets/images/gallery/thumbs/audio-quartet.jpg',
      description: 'Cuarteto de Cuerdas Nº 1 - Cuarteto Quiroga',
      category: 'grabaciones',
      date: '2021-06-10',
      audioUrl: 'https://example.com/audio/cuarteto1.mp3',
      duration: '22:15',
    },
    {
      id: 'concert-aud-3',
      type: 'audio',
      url: 'https://example.com/audio/cuarteto2.mp3',
      thumbnail: '/assets/images/gallery/thumbs/audio-quartet2.jpg',
      description: 'Cuarteto de Cuerdas Nº 2 - Estreno',
      category: 'estrenos-audio',
      date: '2024-12-03',
      audioUrl: 'https://example.com/audio/cuarteto2.mp3',
      duration: '28:30',
    },

    // Obras electrónicas / experimentales
    {
      id: 'electro-aud-1',
      type: 'audio',
      url: 'https://soundcloud.com/example/piano-electronica',
      thumbnail: '/assets/images/gallery/thumbs/audio-electronic.jpg',
      description: 'Obra para Piano y Electrónica - Festival Alicante',
      category: 'electronica',
      date: '2023-09-15',
      audioUrl: 'https://soundcloud.com/example/piano-electronica',
      duration: '12:45',
    },
    {
      id: 'electro-aud-2',
      type: 'audio',
      url: 'https://soundcloud.com/example/ambient-work',
      thumbnail: '/assets/images/gallery/thumbs/audio-ambient.jpg',
      description: 'Paisaje sonoro - Residencia ZKM',
      category: 'electronica',
      date: '2023-05-10',
      audioUrl: 'https://soundcloud.com/example/ambient-work',
      duration: '15:20',
    },

    // Podcasts / Entrevistas audio
    {
      id: 'podcast-aud-1',
      type: 'audio',
      url: 'https://podcast.example.com/episodio-12',
      thumbnail: '/assets/images/gallery/thumbs/audio-podcast.jpg',
      description: 'Podcast "Compositores Hoy" - De la partitura al escenario',
      category: 'podcasts',
      date: '2024-07-15',
      audioUrl: 'https://podcast.example.com/episodio-12',
      duration: '42:10',
    },
    {
      id: 'podcast-aud-2',
      type: 'audio',
      url: 'https://podcast.example.com/episodio-8',
      thumbnail: '/assets/images/gallery/thumbs/audio-podcast2.jpg',
      description: 'Entrevista radiofónica: El compositor y la tecnología',
      category: 'podcasts',
      date: '2024-03-20',
      audioUrl: 'https://podcast.example.com/episodio-8',
      duration: '38:55',
    },
  ];

  getAll(): Observable<GalleryImage[]> {
    return of(this.mockMedia);
  }

  getByCategory(category: string): Observable<GalleryImage[]> {
    return of(this.mockMedia.filter(item => item.category === category));
  }

  getCategories(): string[] {
    const categories = new Set(this.mockMedia.map(item => item.category));
    return Array.from(categories).sort();
  }

  getCategoriesByType(type: MediaType): string[] {
    const categories = new Set(
      this.mockMedia.filter(item => item.type === type).map(item => item.category)
    );
    return Array.from(categories).sort();
  }

  getMediaById(id: string): GalleryImage | undefined {
    return this.mockMedia.find(item => item.id === id);
  }

  getMediaByType(type: MediaType): GalleryImage[] {
    return this.mockMedia.filter(item => item.type === type);
  }

  // For future: load from JSON file
  // loadFromJson(): Observable<GalleryImage[]> {
  //   return this.http.get<GalleryImage[]>('/assets/data/gallery.json');
  // }
}