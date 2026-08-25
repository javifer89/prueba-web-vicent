import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import useEmblaCarousel from 'embla-carousel';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface NewsItem {
  slug: string;
  title: string;
  category: string;
  date: Date;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizedDatePipe, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('emblaRef', { static: false }) emblaRef!: ElementRef<HTMLElement>;

  private emblaApi: ReturnType<typeof useEmblaCarousel> | null = null;
  canScrollNext = false;

  testimonials: Testimonial[] = [
    {
      quote: 'Colaborar junto con Vicent Egea Insa en la creación de nuevas obras fue una experiencia inolvidable. Vicent consiguió que me embarcara en un viaje de sonidos y emociones que nunca antes había experimentado. Todo ello gracias a su prodigiosa creatividad y gran control técnico.',
      name: 'JOSE FRANCH',
      role: 'Clarinet Solist'
    },
    {
      quote: "Vicent is a talented composer across multiple genres. I'm always pleased with the quality of work from him. His compositions are fresh, compelling, and well balanced.",
      name: 'BEN KOPEC',
      role: 'Hollywood Film and TV Producer'
    },
    {
      quote: 'Desde 2015 el Maestro Vicent Egea Insa es un compositor respetado y valioso. Obras maestras como sus piezas para solista y banda son de excelente nivel. Además de ser un compositor hábil, Vicent es una persona muy agradable con quien trabajar. Comunicativamente muy sociable y flexible.',
      name: 'HENK UMMELS',
      role: 'Artistic director, Molenaar'
    },
    {
      quote: 'El maestro Vicent Egea posee un gran talento para la dirección basado en un riguroso trabajo procedente de un conocimiento exhaustivo de la partitura y del respeto, interés y amor por lo que dirige. Todo ello, además, lo ejerce con la máxima energía que imprime a sus conciertos y se convierte en el intérprete deseado por los compositores.',
      name: 'ANDRÉS VALERO CASTELLS',
      role: 'Director y compositor'
    },
    {
      quote: 'Vicent Egea es sin duda el tipo de director a quien pondría en sus manos cualquiera de mis obras, con toda garantía de éxito. Además de su cualidad humana, profesionalmente está muy bien formado, eso junto a su experiencia hacen de él una apuesta segura para cualquier formación sinfónica.',
      name: 'BERNARDO ADAM FERRERO',
      role: 'Director y compositor'
    }
  ];

  featuredNews: NewsItem[] = [
    {
      slug: 'estreno-eternal-echoes-portugal',
      title: 'Estreno de Eternal Echoes en Portugal',
      category: 'Estrenos',
      date: new Date('2024-04-15'),
      image: 'https://images.unsplash.com/photo-1517665421576-ef4c10e0d7bd?w=800&q=80'
    },
    {
      slug: 'estreno-mundial-resilience-eeuu',
      title: 'Estreno mundial de Resilience en Estados Unidos',
      category: 'Estrenos',
      date: new Date('2024-04-10'),
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'
    },
    {
      slug: 'presentacion-cd-gioia',
      title: 'Presentación del CD Gioia',
      category: 'Audiovisual',
      date: new Date('2024-03-20'),
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'
    }
  ];

  ngAfterViewInit(): void {
    this.initEmbla();
  }

  ngOnDestroy(): void {
    this.emblaApi?.destroy();
  }

  private initEmbla(): void {
    const emblaNode = this.emblaRef?.nativeElement;
    if (!emblaNode) return;

    this.emblaApi = useEmblaCarousel(emblaNode, { loop: false, align: 'start' });

    const updateBtnState = () => {
      if (this.emblaApi) {
        this.canScrollNext = this.emblaApi.canScrollNext();
      }
    };

    this.emblaApi.on('select', updateBtnState);
    this.emblaApi.on('init', updateBtnState);
    updateBtnState();
  }

  scrollNext(): void {
    this.emblaApi?.scrollNext();
  }
}