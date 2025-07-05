import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "copy-cname",
      writeBundle() {
        try {
          copyFileSync("public/CNAME", "dist/CNAME");
          console.log("✅ CNAME文件已复制到dist目录");
        } catch (error) {
          console.warn("⚠️ 复制CNAME文件失败:", error);
        }
      },
    },
    {
      name: "fix-html",
      transformIndexHtml(html) {
        return html
          .replace(
            '<div id="app"></div>',
            `<div id="app">
    <div class="loading">正在加载工具导航站...</div>
  </div>
  <script>
    window.addEventListener('error', function(e) {
      console.error('页面加载错误:', e.error);
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = '<div class="loading">加载失败，请刷新页面重试</div>';
      }
    });
    setTimeout(function() {
      const app = document.getElementById('app');
      if (app && app.innerHTML.includes('正在加载')) {
        console.warn('Vue 应用可能未正确加载');
      }
    }, 3000);
  </script>`
          )
          .replace(
            "min-height: 100vh;\n    }",
            `min-height: 100vh;
    }
    #app {
      min-height: 100vh;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: white;
      font-size: 18px;
    }`
          );
      },
    },
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@config": resolve(__dirname, "config"),
      "@scripts": resolve(__dirname, "scripts"),
      "@docs": resolve(__dirname, "docs"),
    },
  },
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      external: ['@rollup/rollup-win32-x64-msvc'],
      output: {
        manualChunks: {
          vendor: ["vue", "pinia"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
  },
});
