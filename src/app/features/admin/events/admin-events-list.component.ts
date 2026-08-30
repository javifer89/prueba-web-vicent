import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, map, catchError, of } from 'rxjs';
import { EventsAdminService } from './events-admin.service';
import { Event, EventStatus, Category } from '../../../core/services/pocketbase/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-admin-events-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-events-list.component.html',
  styleUrls: ['./admin-events-list.component.scss'],
})
export class AdminEventsListComponent implements OnInit {
  private eventsService = inject(EventsAdminService);

  events$!: Observable<Event[]>;
  loading = true;
  searchTerm = '';
  statusFilter: EventStatus | 'all' = 'all';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.events$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.loadEvents(term))
    );

    this.searchSubject.next('');
  }

  private loadEvents(search: string): Observable<Event[]> {
    this.loading = true;
    let filter = '';

    if (this.statusFilter !== 'all') {
      filter = `status="${this.statusFilter}"`;
    }

    if (search) {
      const searchFilter = `(title_ca~"${search}" || title_es~"${search}" || title_en~"${search}" || place~"${search}" || city~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    return this.eventsService.getAll({ filter, sort: '-date,-created', expand: 'category' }).pipe(
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

  onSetUpcoming(event: Event): void {
    if (event.status === 'upcoming') return;
    this.eventsService.setStatus(event.id, 'upcoming').subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error:', err),
    });
  }

  onSetPast(event: Event): void {
    if (event.status === 'past') return;
    this.eventsService.setStatus(event.id, 'past').subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error:', err),
    });
  }

  onDelete(event: Event): void {
    if (!confirm(`¿Eliminar "${event.title_ca}"? Esta acción no se puede deshacer.`)) return;
    this.eventsService.delete(event.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error eliminando:', err),
    });
  }

  private refresh(): void {
    this.searchSubject.next(this.searchTerm);
  }

  getStatusLabel(status: EventStatus): string {
    return this.eventsService.getStatusLabel(status);
  }

  getStatusClass(status: EventStatus): string {
    return this.eventsService.getStatusClass(status);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getCategoryName(category: string | Category): string {
    if (!category) return '';
    if (typeof category === 'object' && category.name_ca) {
      return category.name_ca;
    }
    return typeof category === "object" ? category.name_ca : category;
  }
}