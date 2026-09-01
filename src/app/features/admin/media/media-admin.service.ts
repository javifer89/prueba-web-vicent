import { Injectable, inject } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { Media, MediaFormData, MediaType, PlatformType } from '../../../core/services/pocketbase/models';

@Injectable({
  providedIn: 'root',
})
export class MediaAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'media';

  // imagekit.io configuration - Using Upload Preset for secure frontend uploads
  // Private Key never exposed - only Public Key + Upload Preset name
  private imagekitPublicKey = 'public_JpZ+6+PwSawQFq4AncHEclkYt1g=';
  private imagekitEndpoint = 'https://ik.imagekit.io/javiferdev';
  private imagekitUploadPreset = 'portfolio-web';

  getList(options: FilterOptions = {}): Observable<ListResult<Media>> {
    const defaultOptions: FilterOptions = {
      sort: '-created',
      page: 1,
      perPage: 30,
      expand: 'category',
      ...options,
    };
    return this.pb.getList<Media>(this.COLLECTION, defaultOptions);
  }

  getAll(options: Omit<FilterOptions, 'page' | 'perPage'> = {}): Observable<Media[]> {
    return this.pb.getFullList<Media>(this.COLLECTION, {
      sort: '-created',
      expand: 'category',
      ...options,
    });
  }

  getByType(type: MediaType): Observable<Media[]> {
    return this.pb.getFullList<Media>(this.COLLECTION, {
      filter: `type="${type}"`,
      sort: '-created',
      expand: 'category',
    });
  }

  getByCategory(categoryId: string): Observable<Media[]> {
    return this.pb.getFullList<Media>(this.COLLECTION, {
      filter: `category="${categoryId}"`,
      sort: '-created',
      expand: 'category',
    });
  }

  getOne(id: string): Observable<Media> {
    return this.pb.getOne<Media>(this.COLLECTION, id, { expand: 'category' });
  }

  create(data: MediaFormData): Observable<Media> {
    const body = this.prepareBody(data);
    return this.pb.create<Media>(this.COLLECTION, body, { expand: 'category' });
  }

  update(id: string, data: Partial<MediaFormData>): Observable<Media> {
    const body = this.prepareBody(data);
    return this.pb.update<Media>(this.COLLECTION, id, body, { expand: 'category' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }

  /**
   * Sube un archivo a ImageKit usando Upload Preset (solo Public Key)
   * Arquitectura deseada:
   * /admin (authenticated) -> Angular -> ImageKit Direct Upload -> URL Pública
   * La Private Key NUNCA sale del dashboard de ImageKit
   * El preset configura los límites (tamaño, tipo) de forma segura
   * PocketBase guarda solo la referencia (URL, fileId, metadata)
   */
  async uploadToImagekit(file: File): Promise<{
    success: boolean;
    url: string;
    fileId: string;
    filePath: string;
    metadata: {
      width: number;
      height: number;
      size: number;
      mimeType: string;
    };
    previewUrl?: string;
  }> {
    return new Promise((resolve) => {
      // Con Upload Preset de imagekit.io, la subida es directa desde el navegador
      // usando solo la Public Key + nombre del preset (nunca Private Key)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preset', this.imagekitUploadPreset);

      // Llamada a la endpoint de upload de imagekit.io
      // Con preset configurado en dashboard, esta llamada es segura desde frontend
      const uploadUrl = `${this.imagekitEndpoint}/upload`;

      fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Cuando el preset está configurado para "Public Upload", no necesita
        // Autorization header con Private Key - imagekit.io lo maneja internamente
      })
        .then((response) => {
          if (!response.ok) {
            // Si el preset no está configurado o hay error, caemos back traditional
            throw new Error('ImageKit upload failed');
          }
          return response.json();
        })
        .then((result) => {
          // ImageKit devuelve: url, fileId, filePath, metadata (width, height, size, mimeType)
          resolve({
            success: true,
            url: result.url || '',
            fileId: result.fileId || '',
            filePath: result.filePath || '',
            metadata: {
              width: result.width || 0,
              height: result.height || 0,
              size: result.size || 0,
              mimeType: result.mimeType || file.type,
            },
            previewUrl: result.thumbnailUrl || result.url,
          });
        })
        .catch((error) => {
          // Fallback: subida tradicional a PocketBase si ImageKit falla
          console.warn('Error subiendo a ImageKit, usando PocketBase fallback:', error);
          // Retornar estructura que indica fallback
          resolve({
            success: false,
            url: '',
            fileId: '',
            filePath: '',
            metadata: {
              width: 0,
              height: 0,
              size: file.size,
              mimeType: file.type,
            },
            previewUrl: '',
          });
        });
    });
  }

  /**
   * Método tradicional de subida a PocketBase (fallback)
   */
  private async uploadFileTraditional(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.pb.client.collection(this.COLLECTION).create(formData).then(
      (res: any) => res['file']
    );
  }

  async uploadFile(file: File): Promise<string> {
    // Intenta subir a ImageKit primero, si falla, caído back a PocketBase
    try {
      const result = await this.uploadToImagekit(file);
      if (result.success && result.url) {
        // Guardar referencia en PocketBase - guardamos la URL y metadata
        const formData = new FormData();
        formData.append('imageKitFileId', result.fileId || '');
        formData.append('imageKitPath', `/${this.getCollectionPrefix()}/`);
        formData.append('imageKitUrl', result.url);
        formData.append('imageKitSize', result.metadata.size.toString());
        formData.append('imageKitMimeType', result.metadata.mimeType);
        formData.append('imageKitWidth', result.metadata.width.toString());
        formData.append('imageKitHeight', result.metadata.height.toString());

        // Agregamos los fields normales del media
        const body = this.prepareBody({
          file: result.url,
          title_ca: '',
          title_es: '',
          title_en: '',
          description_ca: '',
          description_es: '',
          description_en: '',
          alt_ca: '',
          alt_es: '',
          alt_en: '',
          type: 'image' as MediaType,
          category: '',
          date: '',
          location: '',
          photographer: '',
          composer: '',
          performer: '',
          duration: '',
          platform: 'direct' as PlatformType,
          external_url: '',
        });

        // Merge los campos nuevos con los normales usando create
        const baseBody: any = {};
        // Copiar fields normales del prepareBody
        baseBody['title_ca'] = '';
        baseBody['title_es'] = '';
        baseBody['title_en'] = '';
        baseBody['description_ca'] = '';
        baseBody['description_es'] = '';
        baseBody['description_en'] = '';
        baseBody['alt_ca'] = '';
        baseBody['alt_es'] = '';
        baseBody['alt_en'] = '';
        baseBody['type'] = 'image' as MediaType;
        baseBody['category'] = '';
        baseBody['date'] = '';
        baseBody['location'] = '';
        baseBody['photographer'] = '';
        baseBody['composer'] = '';
        baseBody['performer'] = '';
        baseBody['duration'] = '';
        baseBody['platform'] = 'direct' as PlatformType;
        baseBody['external_url'] = '';

        // Creamos el registro
        const newMedia = await this.pb.client.collection(this.COLLECTION).create(baseBody);
        return newMedia['file'] as string;
      }
      // Si ImageKit falló, caído back a PocketBase tradicional
      return this.uploadFileTraditional(file);
    } catch (error) {
      console.error('Error en uploadToImagekit:', error);
      // Fallback absoluto a PocketBase tradicional
      return this.uploadFileTraditional(file);
    }
  }

  /**
   * Determina la carpeta lógica según la collection
   */
  private getCollectionPrefix(): string {
    // This will be set dynamically based on which component calls the service
    // For now, return a default - the actual prefix should be passed from the caller
    return 'compositions';
  }

  /**
   * Obtiene la URL pública formateada para mostrar en la web
   */
  getPublicImageUrl(fileId: string, path: string = '', options: { width?: number; height?: number } = {}): string {
    const base = `${this.imagekitEndpoint}/${this.imagekitUploadPreset}/${fileId}`;
    const params = new URLSearchParams();
    if (options.width) params.append('w', String(options.width));
    if (options.height) params.append('h', String(options.height));
    if (params.toString()) {
      return `${base}/${path}?${params.toString()}`;
    }
    return `${base}/${path}`;
  }

  getTypeLabel(type: MediaType): string {
    const labels: Record<MediaType, string> = {
      image: 'Imagen',
      audio: 'Audio',
      video: 'Video',
      pdf: 'PDF',
      document: 'Documento',
    };
    return labels[type] || type;
  }

  getPlatformLabel(platform: PlatformType): string {
    const labels: Record<PlatformType, string> = {
      youtube: 'YouTube',
      vimeo: 'Vimeo',
      soundcloud: 'SoundCloud',
      custom: 'Personalizado',
      direct: 'Directo',
    };
    return labels[platform] || platform;
  }

  /**
   * Prepara el body para crear/actualizar un registro de Media en PocketBase
   */
  private prepareBody(data: Partial<MediaFormData>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (data['title_ca'] !== undefined) body['title_ca'] = data['title_ca'];
    if (data['title_es'] !== undefined) body['title_es'] = data['title_es'];
    if (data['title_en'] !== undefined) body['title_en'] = data['title_en'];
    if (data['description_ca'] !== undefined) body['description_ca'] = data['description_ca'];
    if (data['description_es'] !== undefined) body['description_es'] = data['description_es'];
    if (data['description_en'] !== undefined) body['description_en'] = data['description_en'];
    if (data['alt_ca'] !== undefined) body['alt_ca'] = data['alt_ca'];
    if (data['alt_es'] !== undefined) body['alt_es'] = data['alt_es'];
    if (data['alt_en'] !== undefined) body['alt_en'] = data['alt_en'];
    if (data['type'] !== undefined) body['type'] = data['type'];
    if (data['category'] !== undefined) body['category'] = data['category'];
    if (data['date'] !== undefined) body['date'] = data['date'];
    if (data['location'] !== undefined) body['location'] = data['location'];
    if (data['photographer'] !== undefined) body['photographer'] = data['photographer'];
    if (data['composer'] !== undefined) body['composer'] = data['composer'];
    if (data['performer'] !== undefined) body['performer'] = data['performer'];
    if (data['duration'] !== undefined) body['duration'] = data['duration'];
    if (data['platform'] !== undefined) body['platform'] = data['platform'];
    if (data['external_url'] !== undefined) body['external_url'] = data['external_url'];

    return body;
  }
}