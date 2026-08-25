import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService, Locale } from '../../core/i18n/translation.service';

interface NavItem {
  path: string;
  label: string; // translation key
}

interface LangOption {
  code: Locale;
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private translationService = inject(TranslationService);

  isMenuOpen = false;
  isScrolled = false;
  isLangOpen = false;

  availableLangs: LangOption[] = [
    { code: 'es', name: 'Castellano' },
    { code: 'ca', name: 'Valencià' },
    { code: 'en', name: 'English' },
  ];

  navItems: NavItem[] = [
    { path: '/', label: 'nav.inicio' },
    { path: '/sobre-mi', label: 'nav.sobreMi' }, // Biografía + Galería
    { path: '/obras', label: 'nav.obras' },
    { path: '/multimedia', label: 'nav.multimedia' },
    { path: '/noticias', label: 'nav.noticias' },
    { path: '/contacto', label: 'nav.contacto' },
  ];

  /** Lee el idioma actual directamente del signal del servicio */
  get currentLang(): string {
    return this.translationService.locale();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isLangOpen = false;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleLang(): void {
    this.isLangOpen = !this.isLangOpen;
  }

  setLang(code: Locale): void {
    this.translationService.setLocale(code);
    this.isLangOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 80;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    if (target.innerWidth > 768) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-selector')) {
      this.isLangOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMenuOpen = false;
    this.isLangOpen = false;
  }
}