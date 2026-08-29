import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  submitStatus: 'idle' | 'loading' | 'error' = 'idle';
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitStatus = 'loading';
    this.errorMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.auth.login(email, password);
    } catch (error: unknown) {
      this.submitStatus = 'error';
      const pbError = error as { response?: { data?: { message?: string } }; message?: string };
      this.errorMessage = pbError.response?.data?.message || pbError.message || 'Credenciales inválidas. Inténtalo de nuevo.';
    }
  }

  async onTestCredentials(): Promise<void> {
    this.loginForm.patchValue({
      email: 'admin@ejemplo.com',
      password: 'password123',
    });
  }
}