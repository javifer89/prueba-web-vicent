import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MarkdownPipe } from '../../core/pipes/markdown.pipe';
import { TranslationService, BiographyData } from '../../core/i18n/translation.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// MarkdownPipe is used programmatically, not in template

interface BiographySection {
  text: string;
  image?: string;
  imageAlt?: string;
}

@Component({
  selector: 'app-biography',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './biography.component.html',
  styleUrls: ['./biography.component.scss'],
})
export class BiographyComponent implements OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdownPipe = new MarkdownPipe(this.sanitizer);

  biography: BiographyData | null = null;
  loading = true;
  sections: BiographySection[] = [];

  ngOnInit(): void {
    this.translationService.biography$.subscribe(bio => {
      this.biography = bio;
      this.loading = false;
      if (bio?.text) {
        this.sections = this.parseBiography(bio.text);
      }
    });

    // Initial value
    this.biography = this.translationService.getBiography();
    this.loading = !this.biography?.text;
    if (this.biography?.text) {
      this.sections = this.parseBiography(this.biography.text);
    }
  }

  private parseBiography(markdown: string): BiographySection[] {
    const sections: BiographySection[] = [];

    // Split by image markdown pattern: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const textParts: string[] = [];
    const images: { alt: string; url: string }[] = [];

    while ((match = imageRegex.exec(markdown)) !== null) {
      // Text before this image
      const textBefore = markdown.slice(lastIndex, match.index).trim();
      if (textBefore) {
        textParts.push(textBefore);
      }
      images.push({ alt: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last image
    const remainingText = markdown.slice(lastIndex).trim();
    if (remainingText) {
      textParts.push(remainingText);
    }

    // Combine text parts with images alternating
    // Strategy: Each image gets the text before it (or after if first)
    // We'll pair them: textPart[0] + image[0], textPart[1] + image[1], etc.

    const maxPairs = Math.max(textParts.length, images.length);

    for (let i = 0; i < maxPairs; i++) {
      const section: BiographySection = {
        text: textParts[i] || '',
      };

      if (images[i]) {
        section.image = images[i].url;
        section.imageAlt = images[i].alt || `Imagen ${i + 1}`;
      }

      // Only add if has content
      if (section.text || section.image) {
        sections.push(section);
      }
    }

    // If no images found, return single section with all text
    if (sections.length === 0 && markdown.trim()) {
      sections.push({ text: markdown.trim() });
    }

    return sections;
  }

  renderMarkdown(text: string): SafeHtml {
    if (!text) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownPipe.transform(text));
  }
}