import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Composition } from '../models/composition.model';
import { CompositionService } from '../../../core/services/composition.service';

@Component({
  selector: 'app-composition-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './composition-detail.component.html',
  styleUrls: ['./composition-detail.component.scss'],
})
export class CompositionDetailComponent implements OnInit {
  composition$: Observable<Composition | undefined>;
  composition: Composition | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CompositionService
  ) {}

  ngOnInit(): void {
    this.composition$ = this.route.paramMap.pipe(
      map(params => params.get('slug')),
      switchMap(slug => {
        if (!slug) return of(undefined);
        return this.service.getBySlug(slug);
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