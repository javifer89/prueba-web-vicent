import { Component } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-biography',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './biography.component.html',
  styleUrls: ['./biography.component.scss'],
})
export class BiographyComponent {}