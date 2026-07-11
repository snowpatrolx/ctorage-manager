import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  base: '/ctorage-manager/',
  build: {
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'tensorflow': ['@tensorflow/tfjs', '@tensorflow-models/mobilenet'],
          'pinyin': ['pinyin-pro'],
          'vendor': ['react', 'react-dom', 'react-router-dom', 'zustand', 'dexie', 'dexie-react-hooks', 'xlsx'],
        },
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: process.env.NODE_ENV === 'development' ? [
          'react-dev-locator',
        ] : [],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: '收纳管家',
        short_name: '收纳管家',
        description: '个人物品收纳管理应用',
        theme_color: '#7C9885',
        background_color: '#fafaf9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/ctorage-manager/',
        scope: '/ctorage-manager/',
        lang: 'zh-CN',
        icons: [
          {
            src: '/ctorage-manager/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
})
