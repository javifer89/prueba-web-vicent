import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { PocketBaseService } from '../../../core/services/pocketbase';

interface AdminNavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private pb = inject(PocketBaseService);

  isSidebarCollapsed = signal(false);
  currentRoute = signal('');

  navItems: AdminNavItem[] = [
    { path: '/admin/news', label: 'Noticias', icon: 'newspaper' },
    { path: '/admin/events', label: 'Agenda', icon: 'calendar' },
    { path: '/admin/compositions', label: 'Obras', icon: 'music' },
    { path: '/admin/media', label: 'Medios', icon: 'image' },
    { path: '/admin/galleries', label: 'Galerías', icon: 'grid' },
    { path: '/admin/biography', label: 'Biografía', icon: 'user' },
    { path: '/admin/categories', label: 'Categorías', icon: 'tag' },
    { path: '/admin/settings', label: 'Configuración', icon: 'settings' },
  ];

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.urlAfterRedirects);
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }

  getUserName(): string {
    return this.auth.getUser()?.name || 'Administrador';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isActive(path: string): boolean {
    const current = this.currentRoute();
    return current === path || current.startsWith(path + '/');
  }
}