export const environment = {
      production: false,
      pocketbaseUrl: 'http://127.0.0.1:8090',
      apiTimeout: 30000,
      defaultLocale: 'ca' as const,
      supportedLocales: ['ca', 'es', 'en'] as const,
      // DeepL API configuration for long-text translation
      // Get API key from: https://www.deepl.com/developers
      // Uncomment and add your key to enable translation service
      deeplApiKey: '' as string,
    };