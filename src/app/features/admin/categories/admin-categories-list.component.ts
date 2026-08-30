import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, map, catchError, of } from 'rxjs';
import { CategoriesAdminService } from './categories-admin.service';
import { CategoryType } from '../../../core/services/pocketbase/models';
import { Category } from '../../../core/services/pocketbase/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-admin-categories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-categories-list.component.html',
  styleUrls: ['./admin-categories-list.component.scss'],
})
export class AdminCategoriesListComponent implements OnInit {
  private categoriesService = inject(CategoriesAdminService);

  categories$!: Observable<Category[]>;
  loading = true;
  searchTerm = '';
  typeFilter: CategoryType | 'all' = 'all';
  private searchSubject = new Subject<string>();

  typeOptions: { value: CategoryType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'news', label: 'Noticias' },
    { value: 'events', label: 'Eventos' },
    { value: 'compositions', label: 'Composiciones' },
    { value: 'media', label: 'Multimedia' },
    { value: 'gallery', label: 'Galería' },
  ];

  ngOnInit(): void {
    this.categories$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.loadCategories(term))
    );

    this.searchSubject.next('');
  }

  private loadCategories(search: string): Observable<Category[]> {
    this.loading = true;
    let filter = '';

    if (this.typeFilter !== 'all') {
      filter = `type="${this.typeFilter}"`;
    }

    if (search) {
      const searchFilter = `(name_ca~"${search}" || name_es~"${search}" || name_en~"${search}" || slug~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    return this.categoriesService.getAll({ filter, sort: 'type,order,name_ca' }).pipe(
      map(result => {
        this.loading = false;
        return result;
      }),
      catchError(() => {
        this.loading = false;
        return of([]);
      })
    );
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onTypeChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onDelete(category: Category): void {
    if (!confirm(`¿Eliminar la categoría "${category.name_ca}"? Esta acción no se puede deshacer.`)) return;
    this.categoriesService.delete(category.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error eliminando:', err),
    });
  }

  private refresh(): void {
    this.searchSubject.next(this.searchTerm);
  }

  getTypeLabel(type: CategoryType): string {
    return this.categoriesService.getTypeLabel(type);
  }
}