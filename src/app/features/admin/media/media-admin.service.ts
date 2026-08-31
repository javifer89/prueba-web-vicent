import { Injectable, inject } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { Media, MediaFormData, MediaType, PlatformType } from '../../../core/services/pocketbase/models';

@Injectable({
  providedIn: 'root',
})
export class MediaAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'media';

  getList(options: FilterOptions = {}): Observable<ListResult<Media>> {
    const defaultOptions: FilterOptions = {
      sort: '-created',
      page: 1,
      perPage: 30,
      expand: 'category',
      ...options,
    };
    return this.pb.getList<Media>(this.COLLECTION, defaultOptions);
  }

  getAll(options: Omit<FilterOptions, 'page' | 'perPage'> = {}): Observable<Media[]> {
    return this.pb.getFullList<Media>(this.COLLECTION, {
      sort: '-created',
      expand: 'category',
      ...options,
    });
  }

  getByType(type: MediaType): Observable<Media[]> {
    return this.pb.getFullList<Media>(this.COLLECTION, {
      filter: `type="${type}"`,
      sort: '-created',
      expand: 'category',
    });
  }

  getByCategory(categoryId: string): Observable<Media[]> {
    return this.pb.getFullList<Media>(this.COLLECTION, {
      filter: `category="${categoryId}"`,
      sort: '-created',
      expand: 'category',
    });
  }

  getOne(id: string): Observable<Media> {
    return this.pb.getOne<Media>(this.COLLECTION, id, { expand: 'category' });
  }

  create(data: MediaFormData): Observable<Media> {
    const body = this.prepareBody(data);
    return this.pb.create<Media>(this.COLLECTION, body, { expand: 'category' });
  }

  update(id: string, data: Partial<MediaFormData>): Observable<Media> {
    const body = this.prepareBody(data);
    return this.pb.update<Media>(this.COLLECTION, id, body, { expand: 'category' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const result = await this.pb.client.collection(this.COLLECTION).create(formData);
    return result['file'];
  }

  async deleteFile(id: string): Promise<void> {
    await this.pb.client.collection(this.COLLECTION).update(id, { 'file-': '' });
  }

  private prepareBody(data: Partial<MediaFormData>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (data['title_ca'] !== undefined) body['title_ca'] = data['title_ca'];
    if (data['title_es'] !== undefined) body['title_es'] = data['title_es'];
    if (data['title_en'] !== undefined) body['title_en'] = data['title_en'];
    if (data['description_ca'] !== undefined) body['description_ca'] = data['description_ca'];
    if (data['description_es'] !== undefined) body['description_es'] = data['description_es'];
    if (data['description_en'] !== undefined) body['description_en'] = data['description_en'];
    if (data['alt_ca'] !== undefined) body['alt_ca'] = data['alt_ca'];
    if (data['alt_es'] !== undefined) body['alt_es'] = data['alt_es'];
    if (data['alt_en'] !== undefined) body['alt_en'] = data['alt_en'];
    if (data['type'] !== undefined) body['type'] = data['type'];
    if (data['category'] !== undefined) body['category'] = data['category'];
    if (data['date'] !== undefined) body['date'] = data['date'];
    if (data['location'] !== undefined) body['location'] = data['location'];
    if (data['photographer'] !== undefined) body['photographer'] = data['photographer'];
    if (data['composer'] !== undefined) body['composer'] = data['composer'];
    if (data['performer'] !== undefined) body['performer'] = data['performer'];
    if (data['duration'] !== undefined) body['duration'] = data['duration'];
    if (data['platform'] !== undefined) body['platform'] = data['platform'];
    if (data['external_url'] !== undefined) body['external_url'] = data['external_url'];

    return body;
  }

  getTypeLabel(type: MediaType): string {
    const labels: Record<MediaType, string> = {
      image: 'Imagen',
      audio: 'Audio',
      video: 'Video',
      pdf: 'PDF',
      document: 'Documento',
    };
    return labels[type] || type;
  }

  getPlatformLabel(platform: PlatformType): string {
    const labels: Record<PlatformType, string> = {
      youtube: 'YouTube',
      vimeo: 'Vimeo',
      soundcloud: 'SoundCloud',
      custom: 'Personalizado',
      direct: 'Directo',
    };
    return labels[platform] || platform;
  }
}