import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-biography',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './biography.component.html',
  styleUrls: ['./biography.component.scss'],
})
export class BiographyComponent {
  private translationService = inject(TranslationService);

  /**
   * Raw-content accessor for long-form localized structures
   * (paragraph arrays, award lists, professional data...).
   */
  t(path: string): unknown {
    return this.translationService.getContent(path);
  }
}
