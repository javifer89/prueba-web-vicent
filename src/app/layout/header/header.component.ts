import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = false;

  navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/obras', label: 'Obras' },
    { path: '/biografia', label: 'Biografía' },
    { path: '/agenda', label: 'Agenda' },
    { path: '/multimedia', label: 'Multimedia' },
    { path: '/galeria', label: 'Galería' },
    { path: '/contacto', label: 'Contacto' },
  ];

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    if (target.innerWidth > 768) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(): void {
    this.isMenuOpen = false;
  }
}