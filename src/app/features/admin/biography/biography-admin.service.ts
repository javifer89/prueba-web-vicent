import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PocketBaseService } from '../../core/services/pocketbase';
import { Biography } from '../../core/services/pocketbase/models';

@Injectable({ providedIn: 'root' })
export class BiographyAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'biography';

  getOne(id: string): Observable<Biography> {
    return this.pb.getOne<Biography>(this.COLLECTION, id, { expand: 'category' });
  }

  getFullList(options: { sort?: string } = {}): Observable<Biography[]> {
    return this.pb.getFullList<Biography>(this.COLLECTION, {
      sort: options.sort || '-created',
    });
  }

  create(data: Partial<Biography>): Observable<Biography> {
    return this.pb.create<Biography>(this.COLLECTION, data, { expand: 'category' });
  }

  update(id: string, data: Partial<Biography>): Observable<Biography> {
    return this.pb.update<Biography>(this.COLLECTION, id, data, { expand: 'category' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }
}