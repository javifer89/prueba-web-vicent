import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { SiteSettings } from '../../../core/services/pocketbase/models';

@Injectable({ providedIn: 'root' })
export class SiteSettingsAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'site_settings';

  getOne(id: string): Observable<SiteSettings> {
    return this.pb.getOne<SiteSettings>(this.COLLECTION, id, { expand: 'category' });
  }

  getFullList(options: { sort?: string } = {}): Observable<SiteSettings[]> {
    return this.pb.getFullList<SiteSettings>(this.COLLECTION, {
      sort: options.sort || '-created',
    });
  }

  create(data: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.pb.create<SiteSettings>(this.COLLECTION, data, { expand: 'category' });
  }

  update(id: string, data: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.pb.update<SiteSettings>(this.COLLECTION, id, data, { expand: 'category' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }
}