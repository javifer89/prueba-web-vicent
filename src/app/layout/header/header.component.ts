import { Component, HostListener, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService, Locale } from '../../core/i18n/translation.service';
import { DOCUMENT } from '@angular/common';

interface NavItem {
  path?: string;
  label: string;
  dropdown?: NavDropdownItem[];
}

interface NavDropdownItem {
  path?: string;
  label: string;
  lang?: Locale;
  action?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly translationService = inject(TranslationService);
  private readonly document = inject(DOCUMENT);

  // Signals for reactive UI
  isMenuOpen = signal(false);
  openDropdownIndex = signal<number | null>(null);

  navItems: NavItem[] = [
    { path: '/', label: 'nav.inicio' },
    { path: '/obras', label: 'nav.obras' },
    {
      label: 'nav.sobre',
      dropdown: [
        { path: '/biografia', label: 'nav.biografia' },
        { path: '/galeria', label: 'nav.galeria' }
      ]
    },
    { path: '/agenda', label: 'nav.agenda' },
    { path: '/multimedia', label: 'nav.multimedia' },
    { path: '/noticias', label: 'nav.noticias' },
    { path: '/contacto', label: 'nav.contacto' },
    {
      label: 'nav.idioma',
      dropdown: [
        { label: 'nav.idioma.es', lang: 'es', action: 'changeLang' },
        { label: 'nav.idioma.va', lang: 'va', action: 'changeLang' },
        { label: 'nav.idioma.en', lang: 'en', action: 'changeLang' }
      ]
    },
  ];

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
    if (!this.isMenuOpen()) {
      this.openDropdownIndex.set(null);
    }
  }

  toggleDropdown(index: number): void {
    this.openDropdownIndex.update(current => current === index ? null : index);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.openDropdownIndex.set(null);
  }

  changeLanguage(lang: Locale): void {
    this.closeMenu();
    this.reloadWithLocale(lang);
  }

  private reloadWithLocale(lang: Locale): void {
    const url = new URL(this.document.location.href);
    url.searchParams.set('lang', lang);
    this.document.location.href = url.toString();
  }

  handleDropdownAction(item: NavDropdownItem): void {
    if (item.action === 'changeLang' && item.lang) {
      this.changeLanguage(item.lang);
    }
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex() === index;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    if (target.innerWidth > 768) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const header = target.closest('app-header');
    if (!header) {
      this.closeMenu();
    }
  }

  getCurrentLang(): Locale {
    return this.translationService.getCurrentLocale();
  }
}