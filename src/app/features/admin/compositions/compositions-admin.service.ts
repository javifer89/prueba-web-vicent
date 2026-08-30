import { Injectable, inject } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { Composition, CompositionFormData, ContentStatus } from '../../../core/services/pocketbase/models';

@Injectable({
  providedIn: 'root',
})
export class CompositionsAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'compositions';

  getList(options: FilterOptions = {}): Observable<ListResult<Composition>> {
    const defaultOptions: FilterOptions = {
      sort: '-year,-created',
      page: 1,
      perPage: 30,
      expand: 'category,files,recordings,videos,images',
      ...options,
    };
    return this.pb.getList<Composition>(this.COLLECTION, defaultOptions);
  }

  getAll(options: Omit<FilterOptions, 'page' | 'perPage'> = {}): Observable<Composition[]> {
    return this.pb.getFullList<Composition>(this.COLLECTION, {
      sort: '-year,-created',
      expand: 'category,files,recordings,videos,images',
      ...options,
    });
  }

  getByStatus(status: ContentStatus): Observable<Composition[]> {
    return this.pb.getFullList<Composition>(this.COLLECTION, {
      filter: `status="${status}"`,
      sort: '-year',
      expand: 'category,files,recordings,videos,images',
    });
  }

  getByCategory(categoryId: string): Observable<Composition[]> {
    return this.pb.getFullList<Composition>(this.COLLECTION, {
      filter: `category="${categoryId}"`,
      sort: '-year',
      expand: 'category,files,recordings,videos,images',
    });
  }

  getOne(id: string): Observable<Composition> {
    return this.pb.getOne<Composition>(this.COLLECTION, id, { expand: 'category,files,recordings,videos,images' });
  }

  getBySlug(slug: string): Observable<Composition> {
    return this.pb.getFirstListItem<Composition>(this.COLLECTION, `slug="${slug}"`, { expand: 'category,files,recordings,videos,images' });
  }

  create(data: CompositionFormData): Observable<Composition> {
    const body = this.prepareBody(data);
    return this.pb.create<Composition>(this.COLLECTION, body, { expand: 'category,files,recordings,videos,images' });
  }

  update(id: string, data: Partial<CompositionFormData>): Observable<Composition> {
    const body = this.prepareBody(data);
    return this.pb.update<Composition>(this.COLLECTION, id, body, { expand: 'category,files,recordings,videos,images' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }

  setStatus(id: string, status: ContentStatus): Observable<Composition> {
    return this.update(id, { status });
  }

  private prepareBody(data: Partial<CompositionFormData>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (data['slug'] !== undefined) body['slug'] = data['slug'];
    if (data['title_ca'] !== undefined) body['title_ca'] = data['title_ca'];
    if (data['title_es'] !== undefined) body['title_es'] = data['title_es'];
    if (data['title_en'] !== undefined) body['title_en'] = data['title_en'];
    if (data['year'] !== undefined) body['year'] = data['year'];
    if (data['duration'] !== undefined) body['duration'] = data['duration'];
    if (data['instrumentation_ca'] !== undefined) body['instrumentation_ca'] = data['instrumentation_ca'];
    if (data['instrumentation_es'] !== undefined) body['instrumentation_es'] = data['instrumentation_es'];
    if (data['instrumentation_en'] !== undefined) body['instrumentation_en'] = data['instrumentation_en'];
    if (data['category'] !== undefined) body['category'] = data['category'];
    if (data['description_ca'] !== undefined) body['description_ca'] = data['description_ca'];
    if (data['description_es'] !== undefined) body['description_es'] = data['description_es'];
    if (data['description_en'] !== undefined) body['description_en'] = data['description_en'];
    if (data['premiere_date'] !== undefined) body['premiere_date'] = data['premiere_date'];
    if (data['premiere_place'] !== undefined) body['premiere_place'] = data['premiere_place'];
    if (data['premiere_performers'] !== undefined) body['premiere_performers'] = data['premiere_performers'];
    if (data['premiere_director'] !== undefined) body['premiere_director'] = data['premiere_director'];
    if (data['premiere_festival'] !== undefined) body['premiere_festival'] = data['premiere_festival'];
    if (data['files'] !== undefined) body['files'] = data['files'];
    if (data['recordings'] !== undefined) body['recordings'] = data['recordings'];
    if (data['videos'] !== undefined) body['videos'] = data['videos'];
    if (data['images'] !== undefined) body['images'] = data['images'];
    if (data['performers'] !== undefined) body['performers'] = data['performers'];
    if (data['notes_ca'] !== undefined) body['notes_ca'] = data['notes_ca'];
    if (data['notes_es'] !== undefined) body['notes_es'] = data['notes_es'];
    if (data['notes_en'] !== undefined) body['notes_en'] = data['notes_en'];
    if (data['status'] !== undefined) body['status'] = data['status'];
    if (data['featured'] !== undefined) body['featured'] = data['featured'];

    return body;
  }

  getStatusLabel(status: ContentStatus): string {
    const labels: Record<ContentStatus, string> = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado',
    };
    return labels[status] || status;
  }

  getStatusClass(status: ContentStatus): string {
    const classes: Record<ContentStatus, string> = {
      draft: 'status-draft',
      published: 'status-published',
      archived: 'status-archived',
    };
    return classes[status] || '';
  }
}