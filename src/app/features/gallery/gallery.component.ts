import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../../core/services/gallery.service';
import { GalleryImage, MediaType } from '../compositions/models/composition.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './gallery.component.html',
      styleUrls: [
      './gallery.component.scss',
      './gallery-grid.scss',
      './gallery-lightbox.scss',
    ],
})
export class GalleryComponent implements OnInit {
  @ViewChild('lightbox') lightboxRef!: ElementRef<HTMLDivElement>;
  @ViewChild('lightboxVideo') lightboxVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('lightboxAudio') lightboxAudioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('lightboxIframe') lightboxIframeRef!: ElementRef<HTMLIFrameElement>;

  mediaItems: GalleryImage[] = [];
  filteredItems: GalleryImage[] = [];
  categories: string[] = ['todos'];
  activeCategory = 'todos';

  // Lightbox state
  lightboxOpen = false;
  lightboxIndex = 0;
  lightboxItem: GalleryImage | null = null;
  lightboxLoading = false;
  lightboxVideoUrl: SafeResourceUrl | null = null;

  // Touch/swipe support
  private touchStartX = 0;
  private touchEndX = 0;

  constructor(
    private galleryService: GalleryService,
    private sanitizer: DomSanitizer,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadGallery();
  }

  loadGallery(): void {
    this.galleryService.getAll().subscribe(items => {
      this.mediaItems = items;
      this.filteredItems = items;
      const dynamicCategories = this.galleryService.getCategories();
      this.categories = ['todos', ...dynamicCategories];
    });
  }

  filterByCategory(category: string): void {
    this.activeCategory = category;
    if (category === 'todos') {
      this.filteredItems = this.mediaItems;
    } else {
      this.filteredItems = this.mediaItems.filter(item => item.category === category);
    }
    // Close lightbox when changing category
    if (this.lightboxOpen) {
      this.closeLightbox();
    }
  }

  // Lightbox methods
  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.lightboxItem = this.filteredItems[index];
    this.lightboxLoading = true;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';

    // Prepare video URL if needed
    if (this.lightboxItem?.type === 'video' && this.lightboxItem.url) {
      this.lightboxVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.lightboxItem.url);
    } else {
      this.lightboxVideoUrl = null;
    }
  }

  closeLightbox(): void {
    // Pause video/audio if playing
    if (this.lightboxVideoRef?.nativeElement) {
      this.lightboxVideoRef.nativeElement.pause();
      this.lightboxVideoRef.nativeElement.src = '';
    }
    if (this.lightboxAudioRef?.nativeElement) {
      this.lightboxAudioRef.nativeElement.pause();
      this.lightboxAudioRef.nativeElement.src = '';
    }
    if (this.lightboxIframeRef?.nativeElement) {
      this.lightboxIframeRef.nativeElement.src = '';
    }

    this.lightboxOpen = false;
    this.lightboxItem = null;
    this.lightboxLoading = false;
    this.lightboxVideoUrl = null;
    document.body.style.overflow = '';
  }

  onLightboxImageLoad(): void {
    this.lightboxLoading = false;
  }

  onLightboxImageError(): void {
    this.lightboxLoading = false;
  }

  onLightboxVideoLoad(): void {
    this.lightboxLoading = false;
  }

  onLightboxIframeLoad(): void {
    this.lightboxLoading = false;
  }

  navigateLightbox(direction: 'prev' | 'next'): void {
    if (this.filteredItems.length === 0) return;

    // Pause current media before navigating
    if (this.lightboxVideoRef?.nativeElement) {
      this.lightboxVideoRef.nativeElement.pause();
    }
    if (this.lightboxAudioRef?.nativeElement) {
      this.lightboxAudioRef.nativeElement.pause();
    }

    if (direction === 'prev') {
      this.lightboxIndex = this.lightboxIndex > 0 ? this.lightboxIndex - 1 : this.filteredItems.length - 1;
    } else {
      this.lightboxIndex = this.lightboxIndex < this.filteredItems.length - 1 ? this.lightboxIndex + 1 : 0;
    }

    this.lightboxItem = this.filteredItems[this.lightboxIndex];
    this.lightboxLoading = true;

    // Prepare video URL if needed
    if (this.lightboxItem?.type === 'video' && this.lightboxItem.url) {
      this.lightboxVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.lightboxItem.url);
    } else {
      this.lightboxVideoUrl = null;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.navigateLightbox('prev');
        break;
      case 'ArrowRight':
        this.navigateLightbox('next');
        break;
      case ' ': // Space to play/pause video/audio
        if (this.lightboxItem?.type === 'video' && this.lightboxVideoRef?.nativeElement) {
          event.preventDefault();
          this.toggleVideoPlayback();
        } else if (this.lightboxItem?.type === 'audio' && this.lightboxAudioRef?.nativeElement) {
          event.preventDefault();
          this.toggleAudioPlayback();
        }
        break;
    }
  }

  toggleVideoPlayback(): void {
    const video = this.lightboxVideoRef?.nativeElement;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  toggleAudioPlayback(): void {
    const audio = this.lightboxAudioRef?.nativeElement;
    if (audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }

  // Touch/swipe for mobile
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.navigateLightbox('next');
      } else {
        this.navigateLightbox('prev');
      }
    }
  }

  // Prevent lightbox close when clicking on content
  onLightboxContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // TrackBy for ngFor performance
  trackByItemId(index: number, item: GalleryImage): string {
    return item.id;
  }

  // Format category for display (i18n lookup; filtering still matches raw slugs)
  formatCategory(category: string): string {
    if (category === 'todos') {
      return this.translationService.translate('gallery.all');
    }
    const key = 'gallery.categories.' + this.slugToKey(category);
    return this.translationService.translate(key);
  }

  private slugToKey(slug: string): string {
    return slug.replace(/-([a-zA-Z])/g, (_, c: string) => c.toUpperCase());
  }

  // Get media type icon for grid overlay
  getMediaTypeIcon(type: MediaType): string {
    switch (type) {
      case 'video':
        return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      case 'audio':
        return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8v8M14 10v6M18 12v4"/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    }
  }

}