import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Composition, CompositionCategory } from '../models/composition.model';
import { EditorialContentService } from '../../../core/services/editorial-content.service';

interface CompositionsContent {
  ca: Composition[];
  es: Composition[];
  en: Composition[];
}

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

  constructor(private editorialContentService: EditorialContentService) {}

  ngOnInit(): void {
    this.loadCompositions();
  }

  private loadCompositions(): void {
    this.editorialContentService.getLocalizedContent<Composition[]>('compositions', 'catalog').subscribe(
      content => {
        this.compositions = content || [];
        this.filteredCompositions = this.compositions;
      }
    );
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