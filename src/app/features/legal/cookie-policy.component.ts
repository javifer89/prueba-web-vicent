import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <main class="legal-page">
      <section class="legal-hero">
        <div class="container">
          <h1>{{ 'legal.cookiesTitle' | translate }}</h1>
        </div>
      </section>
      <section class="legal-content">
        <div class="container">
          <article class="legal-article">
            <ng-container *ngFor="let section of t('legal.cookies.sections')">
              <h2>{{ section.title }}</h2>
              <p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>
            </ng-container>
          </article>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .legal-page {
      padding-top: 0;
    }

    .legal-hero {
      background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
        url('https://images.unsplash.com/photo-1517665421576-ef4c10e0d7bd?w=1600&q=80');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      height: 40vh;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--color-white);
      margin-top: -70px;
      padding-top: 70px;

      @media (max-width: 768px) {
        margin-top: -60px;
        padding-top: 60px;
        background-attachment: scroll;
      }

      h1 {
        font-family: var(--font-heading);
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: 400;
        letter-spacing: 2px;
        margin: 0;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
      }
    }

    .legal-content {
      padding: 4rem 0;
    }

    .legal-article {
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;

      h2 {
        font-family: var(--font-heading);
        font-size: 1.5rem;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        color: var(--color-black);
      }

      h3 {
        font-family: var(--font-heading);
        font-size: 1.125rem;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: var(--color-black);
      }

      h2:first-child {
        margin-top: 0;
      }

      p {
        margin-bottom: 1rem;
        color: var(--color-medium-gray);
      }
    }
  `]
})
export class CookiePolicyComponent {
  private translationService = inject(TranslationService);

  /** Raw-content accessor for long-form localized structures. */
  t(path: string): unknown {
    return this.translationService.getContent(path);
  }
}