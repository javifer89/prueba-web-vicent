import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

/** Localized texts for a media item, under `multimedia.items.<tab>` (same order as the TS metadata). */
interface MediaTexts {
  title: string;
  description: string;
  date?: string;
}

/** Non-textual media data kept in TS. */
interface MediaMeta {
  url: string;
  thumbnail?: string;
  platform?: 'youtube' | 'vimeo' | 'soundcloud' | 'custom';
  source?: string;
}

/** Media item as consumed by the template (same binding names as before). */
type MediaItem = MediaMeta & Partial<MediaTexts>;

@Component({
  selector: 'app-multimedia',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './multimedia.component.html',
  styleUrls: ['./multimedia.component.scss'],
})
export class MultimediaComponent {
  private translationService = inject(TranslationService);

  // Labels are rendered through the existing `multimedia.tabs.*` keys.
  activeTab = 'audio';

  tabs = [
    { id: 'audio' },
    { id: 'video' },
    { id: 'interviews' },
    { id: 'others' },
  ];

  private readonly audioMeta: MediaMeta[] = [
    { url: 'https://example.com/audio/concierto-orquestal.mp3', platform: 'custom' },
    { url: 'https://example.com/audio/cuarteto1.mp3', platform: 'custom' },
    { url: 'https://soundcloud.com/example/piano-electronica', platform: 'soundcloud' },
  ];

  private readonly videoMeta: MediaMeta[] = [
    {
      url: 'https://youtube.com/watch?v=example1',
      thumbnail: 'https://img.youtube.com/vi/example1/maxresdefault.jpg',
      platform: 'youtube',
    },
    {
      url: 'https://youtube.com/watch?v=example2',
      thumbnail: 'https://img.youtube.com/vi/example2/maxresdefault.jpg',
      platform: 'youtube',
    },
    {
      url: 'https://vimeo.com/example3',
      thumbnail: 'https://i.vimeocdn.com/video/example3.webp',
      platform: 'vimeo',
    },
  ];

  private readonly interviewMeta: MediaMeta[] = [
    { url: 'https://scherzo.example.com/entrevista-tecnologia', source: 'Revista Scherzo' },
    { url: 'https://festivalalicante.example.com/panel-2024', source: 'Festival de Alicante' },
    { url: 'https://podcast.example.com/episodio-12', source: 'Podcast Compositores Hoy' },
  ];

  private readonly otherMeta: MediaMeta[] = [
    { url: '/assets/pdfs/catalogo-obras.pdf' },
    { url: '/assets/pdfs/dossier-prensa-2024.pdf' },
  ];

  get audioItems(): MediaItem[] {
    return this.withTexts('multimedia.items.audio', this.audioMeta);
  }

  get videoItems(): MediaItem[] {
    return this.withTexts('multimedia.items.video', this.videoMeta);
  }

  get interviewItems(): MediaItem[] {
    return this.withTexts('multimedia.items.interviews', this.interviewMeta);
  }

  get otherItems(): MediaItem[] {
    return this.withTexts('multimedia.items.others', this.otherMeta);
  }

  /** Merges each item's metadata with its localized texts from `multimedia.items.<tab>`. */
  private withTexts(path: string, meta: MediaMeta[]): MediaItem[] {
    const texts = this.translationService.getContent<MediaTexts[]>(path) ?? [];
    return meta.map((m, i) => ({ ...(texts[i] ?? {}), ...m }));
  }

  playVideo(item: MediaItem): void {
    window.open(item.url, '_blank', 'noopener');
  }
}
