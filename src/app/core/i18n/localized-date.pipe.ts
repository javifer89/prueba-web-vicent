import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslationService } from './translation.service';

/**
 * Renders dates following the active TranslationService locale reactively.
 * Impure on purpose: re-evaluates on every change detection cycle so a
 * locale switch immediately re-renders month names without extra wiring.
 */
@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false,
})
export class LocalizedDatePipe implements PipeTransform {
  private translationService = inject(TranslationService);
  private readonly pipes = new Map<string, DatePipe>();

  transform(value: Date | string | number | null | undefined, format = 'dd MMM yyyy'): string | null {
    const locale = this.translationService.locale();
    let datePipe = this.pipes.get(locale);
    if (!datePipe) {
      datePipe = new DatePipe(locale);
      this.pipes.set(locale, datePipe);
    }
    return datePipe.transform(value, format);
  }
}
