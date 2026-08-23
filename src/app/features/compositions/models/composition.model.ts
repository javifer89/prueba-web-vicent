export interface Composition {
  id: string;
  slug: string;
  title: string;
  year?: number;
  duration?: string;
  instrumentation: string;
  category: CompositionCategory;
  description: string;
  premiere?: {
    date?: string;
    place?: string;
    performers?: string[];
    director?: string;
    festival?: string;
  };
  files: CompositionFile[];
  recordings: Recording[];
  videos: Video[];
  images: GalleryImage[];
  performers?: string[];
  notes?: string;
}

export enum CompositionCategory {
  ORCHESTRA = 'Orquesta',
  CHAMBER = 'Música de cámara',
  PIANO = 'Piano',
  VOCAL = 'Música vocal',
  ELECTRONIC = 'Electrónica',
  OTHER = 'Otro'
}

export interface CompositionFile {
  name: string;
  type: 'pdf' | 'zip' | 'doc' | 'other';
  url: string;
  description?: string;
}

export interface Recording {
  title: string;
  url: string;
  description?: string;
  date?: string;
}

export interface Video {
  title: string;
  platform: 'youtube' | 'vimeo' | 'custom';
  url: string;
  thumbnail?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  description?: string;
  category:
    | 'retratos'
    | 'conciertos'
    | 'estrenos'
    | 'ensayos'
    | 'festivales'
    | 'prensa'
    | 'otros';
  date?: string;
}