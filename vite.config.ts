import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/bpm-checker/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BPM Checker',
        short_name: 'BPMChecker',
        description: 'Check your typing speed in BPM',
        theme_color: '#1a1a1a',
        icons: [
          {
            src: 'icon_192.png', // 後述：アイコン画像を用意する必要があります
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
