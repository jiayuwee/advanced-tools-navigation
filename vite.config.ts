import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    // 自定义插件：复制CNAME文件到构建目录
    {
      name: 'copy-cname',
      writeBundle() {
        try {
          copyFileSync('public/CNAME', 'dist/CNAME')
          console.log('✅ CNAME文件已复制到dist目录')
        } catch (error) {
          console.warn('⚠️ 复制CNAME文件失败:', error)
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', 'lucide-vue-next'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
})
