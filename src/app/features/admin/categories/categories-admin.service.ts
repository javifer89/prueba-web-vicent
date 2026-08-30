import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, of, forkJoin } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { Category, CategoryFormData, CategoryType } from '../../../core/services/pocketbase/models';

@Injectable({
  providedIn: 'root',
})
export class CategoriesAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'categories';

  getList(options: FilterOptions = {}): Observable<ListResult<Category>> {
    const defaultOptions: FilterOptions = {
      sort: 'type,order,name_ca',
      page: 1,
      perPage: 30,
      ...options,
    };
    return this.pb.getList<Category>(this.COLLECTION, defaultOptions);
  }

  getAll(options: Omit<FilterOptions, 'page' | 'perPage'> = {}): Observable<Category[]> {
    return this.pb.getFullList<Category>(this.COLLECTION, {
      sort: 'type,order,name_ca',
      ...options,
    });
  }

  getByType(type: CategoryType): Observable<Category[]> {
    return this.pb.getFullList<Category>(this.COLLECTION, {
      filter: `type="${type}"`,
      sort: 'order,name_ca',
    });
  }

  getOne(id: string): Observable<Category> {
    return this.pb.getOne<Category>(this.COLLECTION, id);
  }

  create(data: CategoryFormData): Observable<Category> {
    const body = this.prepareBody(data);
    return this.pb.create<Category>(this.COLLECTION, body);
  }

  update(id: string, data: Partial<CategoryFormData>): Observable<Category> {
    const body = this.prepareBody(data);
    return this.pb.update<Category>(this.COLLECTION, id, body);
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }

  reorder(updates: { id: string; order: number }[]): Observable<Category[]> {
    const requests = updates.map(({ id, order }) =>
      this.pb.update<Category>(this.COLLECTION, id, { order })
    );
    return forkJoin(requests);
  }

  private prepareBody(data: Partial<CategoryFormData>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (data['name_ca'] !== undefined) body['name_ca'] = data['name_ca'];
    if (data['name_es'] !== undefined) body['name_es'] = data['name_es'];
    if (data['name_en'] !== undefined) body['name_en'] = data['name_en'];
    if (data['slug'] !== undefined) body['slug'] = data['slug'];
    if (data['type'] !== undefined) body['type'] = data['type'];
    if (data['order'] !== undefined) body['order'] = data['order'];
    if (data['color'] !== undefined) body['color'] = data['color'];

    return body;
  }

  getTypeLabel(type: CategoryType): string {
    const labels: Record<CategoryType, string> = {
      news: 'Noticias',
      events: 'Eventos',
      compositions: 'Composiciones',
      media: 'Multimedia',
      gallery: 'Galería',
    };
    return labels[type] || type;
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);
  }
}