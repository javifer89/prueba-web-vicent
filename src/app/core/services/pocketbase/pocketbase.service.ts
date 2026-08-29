import { Injectable, inject } from '@angular/core';
import PocketBase from 'pocketbase';
import { environment } from '../../../../environments/environment';
import { Observable, from, of, catchError, map } from 'rxjs';

export type Locale = 'ca' | 'es' | 'en';

export interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface ListResult<T> {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export interface FilterOptions {
  filter?: string;
  sort?: string;
  expand?: string;
  fields?: string;
  page?: number;
  perPage?: number;
  skipTotal?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PocketBaseService {
  private _client: PocketBase | null = null;

  get client(): PocketBase {
    if (!this._client) {
      this._client = new PocketBase(environment.pocketbaseUrl);
      this._client.autoCancellation(false);
    }
    return this._client;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.client.authStore.onChange(() => {
        // Auth state changes are handled by AuthService
      });
    }
  }

  get isAuthenticated(): boolean {
    return this.client.authStore.isValid;
  }

  get token(): string | null {
    return this.client.authStore.token;
  }

  get authRecord(): Record<string, unknown> | null {
    return this.client.authStore.model;
  }

  async authenticateAdmin(email: string, password: string) {
    return this.client.admins.authWithPassword(email, password);
  }

  async authenticate(collection: string, email: string, password: string) {
    return this.client.collection(collection).authWithPassword(email, password);
  }

  async logout() {
    this.client.authStore.clear();
  }

  getAuthHeader(): { Authorization: string } | {} {
    const token = this.client.authStore.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getFileUrl(record: { id: string; collectionId: string; collectionName: string; [key: string]: unknown }, filename: string, options?: { thumb?: string }): Promise<string> {
    return this.client.files.getUrl(record, filename, options);
  }

  getFileUrlSync(record: { id: string; collectionId: string; collectionName: string; [key: string]: unknown }, filename: string, options?: { thumb?: string }): string {
    return this.client.files.getUrl(record, filename, options);
  }

  getList<T extends PocketBaseRecord>(collection: string, options: FilterOptions = {}): Observable<ListResult<T>> {
    return from(this.client.collection(collection).getList<T>(options.page || 1, options.perPage || 30, {
      filter: options.filter,
      sort: options.sort,
      expand: options.expand,
      fields: options.fields,
      skipTotal: options.skipTotal,
    })).pipe(
      catchError(error => {
        console.error(`PocketBase getList error (${collection}):`, error);
        throw error;
      })
    );
  }

  getFullList<T extends PocketBaseRecord>(collection: string, options: FilterOptions = {}): Observable<T[]> {
    return from(this.client.collection(collection).getFullList<T>({
      filter: options.filter,
      sort: options.sort,
      expand: options.expand,
      fields: options.fields,
      perPage: options.perPage,
    })).pipe(
      catchError(error => {
        console.error(`PocketBase getFullList error (${collection}):`, error);
        throw error;
      })
    );
  }

  getOne<T extends PocketBaseRecord>(collection: string, id: string, options: FilterOptions = {}): Observable<T> {
    return from(this.client.collection(collection).getOne<T>(id, {
      expand: options.expand,
      fields: options.fields,
    })).pipe(
      catchError(error => {
        console.error(`PocketBase getOne error (${collection}):`, error);
        throw error;
      })
    );
  }

  getFirstListItem<T extends PocketBaseRecord>(collection: string, filter: string, options: Omit<FilterOptions, 'filter' | 'page' | 'perPage'> = {}): Observable<T> {
    return from(this.client.collection(collection).getFirstListItem<T>(filter, {
      expand: options.expand,
      fields: options.fields,
    })).pipe(
      catchError(error => {
        console.error(`PocketBase getFirstListItem error (${collection}):`, error);
        throw error;
      })
    );
  }

  create<T extends PocketBaseRecord>(collection: string, body: Partial<T>, options: { expand?: string } = {}): Observable<T> {
    return from(this.client.collection(collection).create<T>(body, {
      expand: options.expand,
    })).pipe(
      catchError(error => {
        console.error(`PocketBase create error (${collection}):`, error);
        throw error;
      })
    );
  }

  update<T extends PocketBaseRecord>(collection: string, id: string, body: Partial<T>, options: { expand?: string } = {}): Observable<T> {
    return from(this.client.collection(collection).update<T>(id, body, {
      expand: options.expand,
    })).pipe(
      catchError(error => {
        console.error(`PocketBase update error (${collection}):`, error);
        throw error;
      })
    );
  }

  delete(collection: string, id: string): Observable<boolean> {
    return from(this.client.collection(collection).delete(id)).pipe(
      map(() => true),
      catchError(error => {
        console.error(`PocketBase delete error (${collection}):`, error);
        throw error;
      })
    );
  }

  subscribe<T extends PocketBaseRecord>(collection: string, callback: (data: T) => void): Promise<() => void> {
    return this.client.collection(collection).subscribe('*', (data) => callback(data as unknown as T));
  }

  unsubscribe(collection: string): Promise<void> {
    return this.client.collection(collection).unsubscribe();
  }

  callAPI<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown, queryParams?: Record<string, string>): Observable<T> {
    return from(this.client.send<T>(path, { method, body, query: queryParams })).pipe(
      catchError(error => {
        console.error(`PocketBase API error (${method} ${path}):`, error);
        throw error;
      })
    );
  }

  getLocalizedField<T>(record: any, fieldBase: string, locale: Locale, fallbackLocale: Locale = 'ca'): T {
    const localizedField = `${fieldBase}_${locale}`;
    const fallbackField = `${fieldBase}_${fallbackLocale}`;
    return (record[localizedField] ?? record[fallbackField] ?? null) as T;
  }

  getLocalizedFields<T extends Record<string, unknown>>(record: Record<string, unknown>, fieldBases: string[], locale: Locale, fallbackLocale: Locale = 'ca'): T {
    const result: Record<string, unknown> = {};
    for (const base of fieldBases) {
      result[base] = this.getLocalizedField(record, base, locale, fallbackLocale);
    }
    return result as T;
  }
}