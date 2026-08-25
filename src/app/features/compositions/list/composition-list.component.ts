import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { Composition, CompositionCategory } from '../models/composition.model';
import { CompositionService } from '../../../core/services/composition.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-composition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './composition-list.component.html',
  styleUrls: ['./composition-list.component.scss'],
})
export class CompositionListComponent implements OnInit {
  compositions: Composition[] = [];
  filteredCompositions: Composition[] = [];
  categories: CompositionCategory[] = [
    CompositionCategory.ORCHESTRA,
    CompositionCategory.CHAMBER,
    CompositionCategory.PIANO,
    CompositionCategory.VOCAL,
    CompositionCategory.ELECTRONIC,
    CompositionCategory.OTHER,
  ];
  searchTerm: string = '';

  private translationService = inject(TranslationService);

  /** Display-only mapping: enum value → i18n key. Filtering still compares enum identity. */
  private static readonly CATEGORY_KEYS: Record<CompositionCategory, string> = {
    [CompositionCategory.ORCHESTRA]: 'works.category.orquesta',
    [CompositionCategory.CHAMBER]: 'works.category.chamber',
    [CompositionCategory.PIANO]: 'works.category.piano',
    [CompositionCategory.VOCAL]: 'works.category.vocal',
    [CompositionCategory.ELECTRONIC]: 'works.category.electronic',
    [CompositionCategory.OTHER]: 'works.category.other',
  };

  categoryLabel(category: CompositionCategory): string {
    const key = CompositionListComponent.CATEGORY_KEYS[category];
    return key ? this.translationService.translate(key) : category;
  }

  constructor(private service: CompositionService) {}

  ngOnInit(): void {
    this.loadCompositions();
  }

  loadCompositions(): void {
    this.service.getAll().subscribe(compositions => {
      this.compositions = compositions;
      this.filteredCompositions = compositions;
    });
  }

  onCategoryChange(event: Event): void {
    const selected = (event.target as HTMLSelectElement).value;
    if (selected === 'todos') {
      this.filteredCompositions = this.compositions;
    } else {
      this.filteredCompositions = this.compositions.filter(
        (c) => c.category === (selected as CompositionCategory)
      );
    }
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    const lowercaseQuery = query.toLowerCase();
    this.filteredCompositions = this.compositions.filter(
      (c) =>
        c.title.toLowerCase().includes(lowercaseQuery) ||
        c.description.toLowerCase().includes(lowercaseQuery) ||
        c.instrumentation.toLowerCase().includes(lowercaseQuery)
    );
  }
}