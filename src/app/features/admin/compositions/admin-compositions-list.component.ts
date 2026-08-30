import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, map, catchError, of } from 'rxjs';
import { CompositionsAdminService } from './compositions-admin.service';
import { Composition, Category, ContentStatus } from '../../../core/services/pocketbase/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-admin-compositions-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-compositions-list.component.html',
  styleUrls: ['./admin-compositions-list.component.scss'],
})
export class AdminCompositionsListComponent implements OnInit {
  private compositionsService = inject(CompositionsAdminService);

  compositions$!: Observable<Composition[]>;
  loading = true;
  searchTerm = '';
  statusFilter: ContentStatus | 'all' = 'all';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.compositions$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.loadCompositions(term))
    );

    this.searchSubject.next('');
  }

  private loadCompositions(search: string): Observable<Composition[]> {
    this.loading = true;
    let filter = '';

    if (this.statusFilter !== 'all') {
      filter = `status="${this.statusFilter}"`;
    }

    if (search) {
      const searchFilter = `(title_ca~"${search}" || title_es~"${search}" || title_en~"${search}" || instrumentation_ca~"${search}" || instrumentation_es~"${search}" || instrumentation_en~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    return this.compositionsService.getAll({ filter, sort: '-year,-created', expand: 'category' }).pipe(
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

  onStatusChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onSetStatus(comp: Composition, status: ContentStatus): void {
    if (comp.status === status) return;
    this.compositionsService.setStatus(comp.id, status).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error:', err),
    });
  }

  onDelete(comp: Composition): void {
    if (!confirm(`¿Eliminar "${comp.title_ca}"? Esta acción no se puede deshacer.`)) return;
    this.compositionsService.delete(comp.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error eliminando:', err),
    });
  }

  private refresh(): void {
    this.searchSubject.next(this.searchTerm);
  }

  getStatusLabel(status: ContentStatus): string {
    return this.compositionsService.getStatusLabel(status);
  }

  getStatusClass(status: ContentStatus): string {
    return this.compositionsService.getStatusClass(status);
  }

  getCategoryName(category: string | Category): string {
    if (!category) return '';
    if (typeof category === 'object' && category.name_ca) {
      return category.name_ca;
    }
    return String(category);
  }

  getFilesCount(comp: Composition): number {
    return (comp.files?.length || 0) + (comp.recordings?.length || 0) + (comp.videos?.length || 0) + (comp.images?.length || 0);
  }
}