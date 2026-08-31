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
      deeplApiKey: '' as string,  // ← Dejar vacío por defecto, el admin lo configura
    };