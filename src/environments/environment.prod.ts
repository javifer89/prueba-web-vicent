export const environment = {
      production: true,
      pocketbaseUrl: 'https://pocketbase.tudominio.com',
      apiTimeout: 30000,
      defaultLocale: 'ca' as const,
      supportedLocales: ['ca', 'es', 'en'] as const,
      // DeepL API configuration for long-text translation
      // Get API key from: https://www.deepl.com/developers
      // Uncomment and add your key to enable translation service
      deeplApiKey: '' as string,
    };