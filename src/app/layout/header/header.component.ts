import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService, Locale } from '../../core/i18n/translation.service';

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

  isMenuOpen = false;
  openDropdownIndex: number | null = null;

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
        { label: 'nav.idioma.ca', lang: 'ca', action: 'changeLang' },
        { label: 'nav.idioma.en', lang: 'en', action: 'changeLang' }
      ]
    },
  ];

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.openDropdownIndex = null;
    }
  }

  toggleDropdown(index: number): void {
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.openDropdownIndex = null;
  }

  changeLanguage(lang: Locale): void {
    this.translationService.setLocale(lang);
    this.closeMenu();
  }

  handleDropdownAction(item: NavDropdownItem): void {
    if (item.action === 'changeLang' && item.lang) {
      this.changeLanguage(item.lang);
    }
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    if (target.innerWidth > 768) {
      this.isMenuOpen = false;
      this.openDropdownIndex = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMenuOpen = false;
    this.openDropdownIndex = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const header = target.closest('app-header');
    if (!header) {
      this.openDropdownIndex = null;
    }
  }

  getCurrentLang(): Locale {
    return this.translationService.getCurrentLocale();
  }
}