import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/obras', label: 'Obras' },
    { path: '/biografia', label: 'Biografía' },
    { path: '/agenda', label: 'Agenda' },
    { path: '/multimedia', label: 'Multimedia' },
    { path: '/galeria', label: 'Galería' },
    { path: '/contacto', label: 'Contacto' },
  ];

  socialLinks = [
    { url: '#', label: 'Twitter', icon: 'twitter' },
    { url: '#', label: 'Instagram', icon: 'instagram' },
    { url: '#', label: 'YouTube', icon: 'youtube' },
  ];

  ngOnInit(): void {}
}