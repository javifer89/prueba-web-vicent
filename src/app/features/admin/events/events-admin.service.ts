import { Injectable, inject } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { Event, EventFormData, EventStatus } from '../../../core/services/pocketbase/models';

@Injectable({
  providedIn: 'root',
})
export class EventsAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'events';

  getList(options: FilterOptions = {}): Observable<ListResult<Event>> {
    const defaultOptions: FilterOptions = {
      sort: '-date,-created',
      page: 1,
      perPage: 30,
      expand: 'category',
      ...options,
    };
    return this.pb.getList<Event>(this.COLLECTION, defaultOptions);
  }

  getAll(options: Omit<FilterOptions, 'page' | 'perPage'> = {}): Observable<Event[]> {
    return this.pb.getFullList<Event>(this.COLLECTION, {
      sort: '-date,-created',
      expand: 'category',
      ...options,
    });
  }

  getByStatus(status: EventStatus): Observable<Event[]> {
    return this.pb.getFullList<Event>(this.COLLECTION, {
      filter: `status="${status}"`,
      sort: '-date',
      expand: 'category',
    });
  }

  getOne(id: string): Observable<Event> {
    return this.pb.getOne<Event>(this.COLLECTION, id, { expand: 'category,image' });
  }

  create(data: EventFormData): Observable<Event> {
    const body = this.prepareBody(data);
    return this.pb.create<Event>(this.COLLECTION, body, { expand: 'category,image' });
  }

  update(id: string, data: Partial<EventFormData>): Observable<Event> {
    const body = this.prepareBody(data);
    return this.pb.update<Event>(this.COLLECTION, id, body, { expand: 'category,image' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }

  setStatus(id: string, status: EventStatus): Observable<Event> {
    return this.update(id, { status });
  }

  async uploadCover(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    await this.pb.client.collection(this.COLLECTION).create(formData);
  }

  async deleteCover(id: string): Promise<void> {
    await this.pb.client.collection(this.COLLECTION).update(id, { 'image-': '' });
  }

  private prepareBody(data: Partial<EventFormData>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (data['title_ca'] !== undefined) body['title_ca'] = data['title_ca'];
    if (data['title_es'] !== undefined) body['title_es'] = data['title_es'];
    if (data['title_en'] !== undefined) body['title_en'] = data['title_en'];
    if (data['description_ca'] !== undefined) body['description_ca'] = data['description_ca'];
    if (data['description_es'] !== undefined) body['description_es'] = data['description_es'];
    if (data['description_en'] !== undefined) body['description_en'] = data['description_en'];
    if (data['date'] !== undefined) body['date'] = data['date'];
    if (data['time'] !== undefined) body['time'] = data['time'];
    if (data['place'] !== undefined) body['place'] = data['place'];
    if (data['city'] !== undefined) body['city'] = data['city'];
    if (data['country'] !== undefined) body['country'] = data['country'];
    if (data['program_ca'] !== undefined) body['program_ca'] = data['program_ca'];
    if (data['program_es'] !== undefined) body['program_es'] = data['program_es'];
    if (data['program_en'] !== undefined) body['program_en'] = data['program_en'];
    if (data['performers_ca'] !== undefined) body['performers_ca'] = data['performers_ca'];
    if (data['performers_es'] !== undefined) body['performers_es'] = data['performers_es'];
    if (data['performers_en'] !== undefined) body['performers_en'] = data['performers_en'];
    if (data['url'] !== undefined) body['url'] = data['url'];
    if (data['status'] !== undefined) body['status'] = data['status'];
    if (data['featured'] !== undefined) body['featured'] = data['featured'];
    if (data['category'] !== undefined) body['category'] = data['category'];

    return body;
  }

  getStatusLabel(status: EventStatus): string {
    return status === 'upcoming' ? 'Próximo' : 'Pasado';
  }

  getStatusClass(status: EventStatus): string {
    return status === 'upcoming' ? 'status-upcoming' : 'status-past';
  }
}