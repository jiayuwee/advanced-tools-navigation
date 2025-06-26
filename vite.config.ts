import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    vue(),
    // 自定义插件：复制CNAME文件到构建目录
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
    // 自定义插件：修复HTML文件
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
    // 错误处理
    window.addEventListener('error', function(e) {
      console.error('页面加载错误:', e.error);
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = '<div class="loading">加载失败，请刷新页面重试</div>';
      }
    });

    // 检查资源加载
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
      output: {
        manualChunks: {
          vendor: ["vue", "pinia", "lucide-vue-next"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: true,
  },
});
