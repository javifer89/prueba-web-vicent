import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MediaItem {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  platform?: 'youtube' | 'vimeo' | 'soundcloud' | 'custom';
  source?: string;
  date?: string;
}

@Component({
  selector: 'app-multimedia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multimedia.component.html',
  styleUrls: ['./multimedia.component.scss'],
})
export class MultimediaComponent {
  activeTab = 'audio';

  tabs = [
    { id: 'audio', label: 'Audio' },
    { id: 'video', label: 'Vídeo' },
    { id: 'interviews', label: 'Entrevistas' },
    { id: 'others', label: 'Otros' },
  ];

  audioItems: MediaItem[] = [
    {
      title: 'Concierto Orquestal - Grabación Completa',
      description: 'Estreno en el Teatro Real, Madrid. Noviembre 2024.',
      url: 'https://example.com/audio/concierto-orquestal.mp3',
      platform: 'custom',
    },
    {
      title: 'Cuarteto de Cuerdas Nº 1 - Cuarteto Quiroga',
      description: 'Grabación de estudio, 2021. Encargo del CNDM.',
      url: 'https://example.com/audio/cuarteto1.mp3',
      platform: 'custom',
    },
    {
      title: 'Obra para Piano y Electrónica',
      description: 'Interpretación en el Festival de Alicante, 2023.',
      url: 'https://soundcloud.com/example/piano-electronica',
      platform: 'soundcloud',
    },
  ];

  videoItems: MediaItem[] = [
    {
      title: 'Entrevista: Proceso Composicional',
      description: 'Charla sobre metodología y técnicas de composición contemporánea.',
      url: 'https://youtube.com/watch?v=example1',
      thumbnail: 'https://img.youtube.com/vi/example1/maxresdefault.jpg',
      platform: 'youtube',
    },
    {
      title: 'Estreno "Concierto Orquestal" - Teatro Real',
      description: 'Vídeo completo del estreno absoluto, noviembre 2024.',
      url: 'https://youtube.com/watch?v=example2',
      thumbnail: 'https://img.youtube.com/vi/example2/maxresdefault.jpg',
      platform: 'youtube',
    },
    {
      title: 'Masterclass en Conservatorio Superior',
      description: 'Sesión de trabajo con estudiantes de composición.',
      url: 'https://vimeo.com/example3',
      thumbnail: 'https://i.vimeocdn.com/video/example3.webp',
      platform: 'vimeo',
    },
  ];

  interviewItems: MediaItem[] = [
    {
      title: 'El compositor y la tecnología',
      description: 'Entrevista para Revista Scherzo sobre electrónica en tiempo real.',
      url: 'https://scherzo.example.com/entrevista-tecnologia',
      source: 'Revista Scherzo',
      date: 'Octubre 2024',
    },
    {
      title: 'Música del siglo XXI: retos y oportunidades',
      description: 'Panel de expertos en el Festival de Alicante.',
      url: 'https://festivalalicante.example.com/panel-2024',
      source: 'Festival de Alicante',
      date: 'Septiembre 2024',
    },
    {
      title: 'De la partitura al escenario',
      description: 'Podcast "Compositores Hoy" - Episodio 12.',
      url: 'https://podcast.example.com/episodio-12',
      source: 'Podcast Compositores Hoy',
      date: 'Julio 2024',
    },
  ];

  otherItems: MediaItem[] = [
    {
      title: 'Catálogo de Obras (PDF)',
      description: 'Catálogo completo actualizado con fichas técnicas.',
      url: '/assets/pdfs/catalogo-obras.pdf',
    },
    {
      title: 'Dossier de Prensa 2024',
      description: 'Material gráfico, biografías y notas de programa para medios.',
      url: '/assets/pdfs/dossier-prensa-2024.pdf',
    },
  ];

  playVideo(item: MediaItem): void {
    window.open(item.url, '_blank', 'noopener');
  }
}