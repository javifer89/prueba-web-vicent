import { Injectable, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PocketBaseService, AdminUser } from './pocketbase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private pb = inject(PocketBaseService);
  private router = inject(Router);

  private _user = signal<AdminUser | null>(null);
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this.pb.isAuthenticated && this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor() {
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    if (this.pb.isAuthenticated) {
      await this.refreshUser();
    }
  }

  async refreshUser(): Promise<void> {
    if (!this.pb.isAuthenticated) {
      this._user.set(null);
      return;
    }

    try {
      const record = await this.pb.client.collection('admins').authRefresh<AdminUser>();
      this._user.set(record.record as unknown as AdminUser);
    } catch {
      this.pb.client.authStore.clear();
      this._user.set(null);
    }
  }

  async login(email: string, password: string): Promise<void> {
    this._loading.set(true);
    try {
      const authData = await this.pb.client.collection('admins').authWithPassword<AdminUser>(email, password);
      this._user.set(authData.record as unknown as AdminUser);
      await this.router.navigate(['/admin']);
    } catch (error) {
      this._loading.set(false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.pb.client.authStore.clear();
    this._user.set(null);
    await this.router.navigate(['/admin/login']);
  }

  getUser(): AdminUser | null {
    return this._user();
  }

  getToken(): string | null {
    return this.pb.token;
  }
}