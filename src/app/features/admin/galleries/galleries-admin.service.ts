import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { Gallery } from '../../../core/services/pocketbase/models';

@Injectable({ providedIn: 'root' })
export class GalleryAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'galleries';

  getOne(id: string): Observable<Gallery> {
    return this.pb.getOne<Gallery>(this.COLLECTION, id, { expand: 'images,category' });
  }

  getFullList(options: { sort?: string } = {}): Observable<Gallery[]> {
    return this.pb.getFullList<Gallery>(this.COLLECTION, {
      sort: options.sort || '-created',
    });
  }

  getList(page: number, perPage: number, options: { filter?: string; sort?: string; expand?: string } = {}): Observable<any> {
    return this.pb.getList<Gallery>(this.COLLECTION, {
      page,
      perPage,
      filter: options.filter,
      sort: options.sort,
      expand: options.expand,
    });
  }

  create(data: Partial<Gallery>): Observable<Gallery> {
    return this.pb.create<Gallery>(this.COLLECTION, data, { expand: 'images,category' });
  }

  update(id: string, data: Partial<Gallery>): Observable<Gallery> {
    return this.pb.update<Gallery>(this.COLLECTION, id, data, { expand: 'images,category' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }
}