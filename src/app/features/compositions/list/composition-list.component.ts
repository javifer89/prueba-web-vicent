import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { Composition, CompositionCategory } from '../models/composition.model';
import { CompositionService } from '../../../core/services/composition.service';

@Component({
  selector: 'app-composition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
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