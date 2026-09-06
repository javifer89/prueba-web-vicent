import type { PocketBaseRecord } from './pocketbase.service';

export type Locale = 'es' | 'va' | 'en';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type EventStatus = 'upcoming' | 'past';
export type TranslationStatus = 'current' | 'outdated' | 'pending' | 'missing';
export type CategoryType = 'news' | 'events' | 'compositions' | 'media' | 'gallery';
export type MediaType = 'image' | 'audio' | 'video' | 'pdf' | 'document';
export type PlatformType = 'youtube' | 'vimeo' | 'soundcloud' | 'custom' | 'direct';
export type AdminRole = 'admin' | 'editor';

export interface AdminUser extends PocketBaseRecord {
  name: string;
  role: AdminRole;
  avatar?: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
}

export interface Category extends PocketBaseRecord {
  name_ca: string;
  name_es: string;
  name_en: string;
  slug: string;
  type: CategoryType;
  order: number;
  color?: string;
}

export interface News extends PocketBaseRecord {
  slug: string;
  status: ContentStatus;
  featured: boolean;
  published_at?: string;
  title_ca: string;
  title_es?: string;
  title_en?: string;
  excerpt_ca: string;
  excerpt_es?: string;
  excerpt_en?: string;
  content_ca: string;
  content_es?: string;
  content_en?: string;
  seo_title_ca?: string;
  seo_title_es?: string;
  seo_title_en?: string;
  seo_description_ca?: string;
  seo_description_es?: string;
  seo_description_en?: string;
  cover?: string;
  category?: string | Category;
  translation_status_es: TranslationStatus;
  translation_status_en: TranslationStatus;
  translation_last_gen: string;
}

export interface Event extends PocketBaseRecord {
  title_ca: string;
  title_es?: string;
  title_en?: string;
  description_ca: string;
  description_es?: string;
  description_en?: string;
  date: string;
  time?: string;
  place: string;
  city: string;
  country: string;
  program_ca?: string;
  program_es?: string;
  program_en?: string;
  performers_ca?: string;
  performers_es?: string;
  performers_en?: string;
  url?: string;
  image?: string;
  status: EventStatus;
  featured: boolean;
  category?: string | Category;
}

export interface Biography extends PocketBaseRecord {
  formacion_ca: string;
  formacion_es?: string;
  formacion_en?: string;
  trayectoria_direccion_ca: string;
  trayectoria_direccion_es?: string;
  trayectoria_direccion_en?: string;
  trayectoria_composicion_ca: string;
  trayectoria_composicion_es?: string;
  trayectoria_composicion_en?: string;
  trayectoria_docencia_ca: string;
  trayectoria_docencia_es?: string;
  trayectoria_docencia_en?: string;
  portrait?: string;
}

export interface Composition extends PocketBaseRecord {
  slug: string;
  title_ca: string;
  title_es?: string;
  title_en?: string;
  year: number;
  duration?: string;
  instrumentation_ca: string;
  instrumentation_es?: string;
  instrumentation_en?: string;
  category?: string | Category;
  description_ca: string;
  description_es?: string;
  description_en?: string;
  premiere_date?: string;
  premiere_place?: string;
  premiere_performers?: string[];
  premiere_director?: string;
  premiere_festival?: string;
  files?: string[] | Media[];
  recordings?: string[] | Media[];
  videos?: string[] | Media[];
  images?: string[] | Media[];
  performers?: string[];
  notes_ca?: string;
  notes_es?: string;
  notes_en?: string;
  status: ContentStatus;
  featured: boolean;
}

export interface Media extends PocketBaseRecord {
  file: string;
  title_ca: string;
  title_es?: string;
  title_en?: string;
  description_ca?: string;
  description_es?: string;
  description_en?: string;
  alt_ca?: string;
  alt_es?: string;
  alt_en?: string;
  type: MediaType;
  category?: string | Category;
  date?: string;
  location?: string;
  photographer?: string;
  composer?: string;
  performer?: string;
  duration?: string;
  platform?: PlatformType;
  external_url?: string;
}

export interface Gallery extends PocketBaseRecord {
  title_ca: string;
  title_es?: string;
  title_en?: string;
  description_ca?: string;
  description_es?: string;
  description_en?: string;
  cover?: string;
  images?: string[] | Media[];
  status: ContentStatus;
  featured: boolean;
}

export interface SiteSettings extends PocketBaseRecord {
  hero_title_ca: string;
  hero_title_es?: string;
  hero_title_en?: string;
  hero_subtitle_ca: string;
  hero_subtitle_es?: string;
  hero_subtitle_en?: string;
  site_name: string;
  site_description_ca: string;
  site_description_es?: string;
  site_description_en?: string;
  og_default_image?: string;
  social_links?: Record<string, string>;
  contact_email?: string;
  contact_formspree_id?: string;
}

export interface CategoryFormData {
  name_ca: string;
  name_es: string;
  name_en: string;
  slug: string;
  type: CategoryType;
  order: number;
  color?: string;
}

export interface NewsFormData {
  slug: string;
  status: ContentStatus;
  featured: boolean;
  published_at?: string;
  title_ca: string;
  title_es: string;
  title_en: string;
  excerpt_ca: string;
  excerpt_es: string;
  excerpt_en: string;
  content_ca: string;
  content_es: string;
  content_en: string;
  seo_title_ca?: string;
  seo_title_es?: string;
  seo_title_en?: string;
  seo_description_ca?: string;
  seo_description_es?: string;
  seo_description_en?: string;
  cover?: File;
  category?: string;
}

export interface EventFormData {
  title_ca: string;
  title_es?: string;
  title_en?: string;
  description_ca: string;
  description_es?: string;
  description_en: string;
  date: string;
  time?: string;
  place: string;
  city: string;
  country: string;
  program_ca?: string;
  program_es?: string;
  program_en?: string;
  performers_ca?: string;
  performers_es?: string;
  performers_en?: string;
  url?: string;
  status: EventStatus;
  featured: boolean;
  category?: string;
}

export interface CompositionFormData {
  slug: string;
  title_ca: string;
  title_es?: string;
  title_en?: string;
  year: number;
  duration?: string;
  instrumentation_ca: string;
  instrumentation_es?: string;
  instrumentation_en?: string;
  category?: string;
  description_ca: string;
  description_es?: string;
  description_en?: string;
  premiere_date?: string;
  premiere_place?: string;
  premiere_performers?: string[];
  premiere_director?: string;
  premiere_festival?: string;
  files?: string[];
  recordings?: string[];
  videos?: string[];
  images?: string[];
  performers?: string[];
  notes_ca?: string;
  notes_es?: string;
  notes_en?: string;
  status: ContentStatus;
  featured: boolean;
}

export interface MediaFormData {
  file?: File | string;
  title_ca: string;
  title_es?: string;
  title_en?: string;
  description_ca?: string;
  description_es?: string;
  description_en?: string;
  alt_ca?: string;
  alt_es?: string;
  alt_en?: string;
  type: MediaType;
  category?: string;
  date?: string;
  location?: string;
  photographer?: string;
  composer?: string;
  performer?: string;
  duration?: string;
  platform?: PlatformType;
  external_url?: string;
}

export interface GalleryFormData {
  title_ca: string;
  title_es?: string;
  title_en?: string;
  description_ca?: string;
  description_es?: string;
  description_en?: string;
  cover?: File;
  images?: string[];
  status: ContentStatus;
  featured: boolean;
}

export interface LocalizedField {
  es: string;
  va: string;
  en: string;
}

export function getLocalizedValue(obj: Record<string, unknown>, base: string, locale: Locale, fallback: Locale = 'va'): string {
  return (obj[`${base}_${locale}`] as string) || (obj[`${base}_${fallback}`] as string) || '';
}

export function setLocalizedValue(obj: Record<string, unknown>, base: string, locale: Locale, value: string): void {
  obj[`${base}_${locale}`] = value;
}

export function getAllLocales(obj: Record<string, unknown>, base: string): LocalizedField {
  return {
    es: (obj[`${base}_es`] as string) || '',
    va: (obj[`${base}_va`] as string) || '',
    en: (obj[`${base}_en`] as string) || '',
  };
}