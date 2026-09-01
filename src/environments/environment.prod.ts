export const environment = {
      production: true,
      pocketbaseUrl: 'https://pocketbase.tudominio.com',
      apiTimeout: 30000,
      defaultLocale: 'ca' as const,
      supportedLocales: ['ca', 'es', 'en'] as const,
      // DeepL API configuration for admin translation service
      // Get API key from: https://www.deepl.com/developers
      // This key is ONLY used in admin panel, NOT exposed to public frontend
      // The TranslationService.init(apiKey) must be called with this key during app bootstrap
      imagekitPublicKey: 'public_JpZ+6+PwSawQFq4AncHEclkYt1g=',
      imagekitPrivateKey: 'REMOVED_PRIVATE_KEY',
      imagekitEndpoint: 'https://ik.imagekit.io/javiferdev',
      imagekitUploadPreset: 'portfolio-web', // Upload Preset name (crear en dashboard)
    };
