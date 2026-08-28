import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  navLinks = [
    { path: '/', label: 'nav.inicio' },
    { path: '/obras', label: 'nav.obras' },
    { path: '/biografia', label: 'nav.biografia' },
    { path: '/agenda', label: 'nav.agenda' },
    { path: '/multimedia', label: 'nav.multimedia' },
    { path: '/galeria', label: 'nav.galeria' },
    { path: '/contacto', label: 'nav.contacto' },
  ];

  socialLinks = [
    { url: '#', label: 'Twitter', icon: 'twitter', ariaLabel: 'footer.social.twitter' },
    { url: '#', label: 'Instagram', icon: 'instagram', ariaLabel: 'footer.social.instagram' },
    { url: '#', label: 'YouTube', icon: 'youtube', ariaLabel: 'footer.social.youtube' },
  ];
}