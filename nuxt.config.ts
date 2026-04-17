// https://nuxt.com/docs/api/configuration/nuxt-config
const baseURL = process.env.NUXT_APP_BASE_URL ?? '/'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    baseURL,
    head: {
      title: '動物學堂',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: `${baseURL}icons/icon-192x192.png` },
        { rel: 'icon', type: 'image/x-icon', href: `${baseURL}favicon.ico` }
      ]
    }
  },

  // 啟用模組
  modules: ['@vite-pwa/nuxt', '@pinia/nuxt'],

  // PWA 設定
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: '動物學堂 Animal Academy',
      short_name: 'AnimalAcademy',
      description: '國小互動學習遊戲系統，支援一至三年級英文與數學題庫',
      theme_color: '#4CAF50',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: baseURL,
      start_url: baseURL,
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      // CacheFirst 策略快取靜態題庫 JSON 與圖片
      runtimeCaching: [
        {
          urlPattern: /\/data\/.+\.json$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'quiz-data',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
            }
          }
        },
        {
          urlPattern: /\/images\/.+\.(png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'animal-images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        }
      ],
      // 預快取所有靜態資源
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  // TypeScript 設定
  typescript: {
    strict: true
  },

  // 全域 CSS（Nuxt 4 中 ~ 指向 srcDir = app/）
  css: ['~/assets/css/main.css']
})
