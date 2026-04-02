// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
      // Only available server-side
      apiKey: process.env.API_KEY,

      // Public variables (also available client-side)
      public: {
        apiKey: process.env.API_KEY,

        apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      }
  },
  ui: {
    safelistColors:['brand'],
      colorMode: false,
      theme: {
            colors: [
              'primary',
              'brand',
            ]
          }
  }
})
