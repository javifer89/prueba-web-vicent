import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { TranslatePipe } from './core/i18n/translate.pipe';

@Component({
  selector: 'ng-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}