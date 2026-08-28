import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Composition } from '../models/composition.model';
import { EditorialContentService } from '../../../core/services/editorial-content.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-composition-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './composition-detail.component.html',
  styleUrls: ['./composition-detail.component.scss'],
})
export class CompositionDetailComponent implements OnInit {
  composition$!: Observable<Composition | undefined>;
  composition: Composition | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editorialContentService: EditorialContentService
  ) {}

  ngOnInit(): void {
    this.composition$ = this.route.paramMap.pipe(
      map(params => params.get('slug')),
      switchMap(slug => {
        if (!slug) return of(undefined);
        return this.editorialContentService.getLocalizedContent<Composition[]>('compositions', 'catalog').pipe(
          map(compositions => compositions?.find(c => c.slug === slug))
        );
      }),
      catchError(() => of(undefined))
    );

    this.composition$.subscribe(comp => {
      this.composition = comp;
      if (!comp) {
        this.router.navigate(['/obras']);
      }
    });
  }
}