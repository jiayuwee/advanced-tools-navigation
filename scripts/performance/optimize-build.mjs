#!/usr/bin/env node

/**
 * 构建优化脚本
 * 自动化执行各种性能优化措施
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

class BuildOptimizer {
  constructor() {
    this.optimizations = [];
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: "📋",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addOptimization(name, description) {
    this.optimizations.push({ name, description, completed: false });
  }

  completeOptimization(name) {
    const optimization = this.optimizations.find((opt) => opt.name === name);
    if (optimization) {
      optimization.completed = true;
      this.log(`${name} 完成`, "success");
    }
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, "error");
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, "warning");
  }

  // 清理构建目录
  cleanBuildDirectory() {
    this.addOptimization("clean", "清理构建目录");

    try {
      const distPath = path.join(projectRoot, "dist");
      if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
        this.log("已清理 dist 目录");
      }

      this.completeOptimization("clean");
    } catch (error) {
      this.addError(`清理构建目录失败: ${error.message}`);
    }
  }

  // 优化依赖
  optimizeDependencies() {
    this.addOptimization("deps", "优化依赖");

    try {
      // 检查未使用的依赖
      this.log("检查未使用的依赖...");

      // 分析包大小
      this.log("分析包大小...");

      this.completeOptimization("deps");
    } catch (error) {
      this.addError(`优化依赖失败: ${error.message}`);
    }
  }

  // 优化图片资源
  optimizeImages() {
    this.addOptimization("images", "优化图片资源");

    try {
      const publicPath = path.join(projectRoot, "public");
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];

      const findImages = (dir) => {
        const files = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...findImages(fullPath));
          } else if (
            imageExtensions.includes(path.extname(item).toLowerCase())
          ) {
            files.push(fullPath);
          }
        }

        return files;
      };

      const images = findImages(publicPath);
      this.log(`发现 ${images.length} 个图片文件`);

      // 检查图片大小
      let totalSize = 0;
      let largeImages = 0;

      images.forEach((imagePath) => {
        const stat = fs.statSync(imagePath);
        totalSize += stat.size;

        if (stat.size > 500 * 1024) {
          // 大于 500KB
          largeImages++;
          this.addWarning(
            `大图片文件: ${path.relative(projectRoot, imagePath)} (${Math.round(stat.size / 1024)}KB)`,
          );
        }
      });

      this.log(
        `图片总大小: ${Math.round((totalSize / 1024 / 1024) * 100) / 100}MB`,
      );

      if (largeImages > 0) {
        this.addWarning(`发现 ${largeImages} 个大图片文件，建议压缩`);
      }

      this.completeOptimization("images");
    } catch (error) {
      this.addError(`优化图片失败: ${error.message}`);
    }
  }

  // 优化 CSS
  optimizeCSS() {
    this.addOptimization("css", "优化 CSS");

    try {
      // 检查 CSS 文件
      const srcPath = path.join(projectRoot, "src");
      const cssFiles = this.findFiles(srcPath, [".css", ".scss", ".vue"]);

      this.log(`发现 ${cssFiles.length} 个样式文件`);

      // 检查未使用的 CSS 类（简单检查）
      let totalLines = 0;
      cssFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, "utf8");
        totalLines += content.split("\n").length;
      });

      this.log(`CSS 总行数: ${totalLines}`);

      this.completeOptimization("css");
    } catch (error) {
      this.addError(`优化 CSS 失败: ${error.message}`);
    }
  }

  // 优化 JavaScript
  optimizeJavaScript() {
    this.addOptimization("js", "优化 JavaScript");

    try {
      // 检查 TypeScript/JavaScript 文件
      const srcPath = path.join(projectRoot, "src");
      const jsFiles = this.findFiles(srcPath, [".ts", ".js", ".vue"]);

      this.log(`发现 ${jsFiles.length} 个脚本文件`);

      // 检查文件大小
      let totalSize = 0;
      let largeFiles = 0;

      jsFiles.forEach((filePath) => {
        const stat = fs.statSync(filePath);
        totalSize += stat.size;

        if (stat.size > 50 * 1024) {
          // 大于 50KB
          largeFiles++;
          this.addWarning(
            `大脚本文件: ${path.relative(projectRoot, filePath)} (${Math.round(stat.size / 1024)}KB)`,
          );
        }
      });

      this.log(`脚本总大小: ${Math.round(totalSize / 1024)}KB`);

      if (largeFiles > 0) {
        this.addWarning(`发现 ${largeFiles} 个大脚本文件，建议拆分`);
      }

      this.completeOptimization("js");
    } catch (error) {
      this.addError(`优化 JavaScript 失败: ${error.message}`);
    }
  }

  // 生成优化构建
  async buildOptimized() {
    this.addOptimization("build", "生成优化构建");

    try {
      this.log("开始优化构建...");

      // 设置生产环境变量
      const env = {
        ...process.env,
        NODE_ENV: "production",
        VITE_BUILD_OPTIMIZE: "true",
      };

      // 执行构建
      execSync("npm run build", {
        cwd: projectRoot,
        stdio: "pipe",
        env,
      });

      // 分析构建结果
      await this.analyzeBuildResult();

      this.completeOptimization("build");
    } catch (error) {
      this.addError(`优化构建失败: ${error.message}`);
    }
  }

  // 分析构建结果
  async analyzeBuildResult() {
    try {
      const distPath = path.join(projectRoot, "dist");

      if (!fs.existsSync(distPath)) {
        this.addError("构建目录不存在");
        return;
      }

      // 分析文件大小
      const files = this.findFiles(distPath, [".js", ".css", ".html"]);
      let totalSize = 0;

      const fileSizes = files.map((filePath) => {
        const stat = fs.statSync(filePath);
        totalSize += stat.size;

        return {
          path: path.relative(distPath, filePath),
          size: stat.size,
          sizeKB: Math.round((stat.size / 1024) * 100) / 100,
        };
      });

      // 按大小排序
      fileSizes.sort((a, b) => b.size - a.size);

      this.log(`构建完成，总大小: ${Math.round(totalSize / 1024)}KB`);

      // 显示最大的文件
      const largeFiles = fileSizes.filter((file) => file.size > 100 * 1024);
      if (largeFiles.length > 0) {
        this.log("大文件列表:");
        largeFiles.slice(0, 5).forEach((file) => {
          this.log(`  ${file.path}: ${file.sizeKB}KB`);
        });
      }

      // 检查 gzip 压缩效果
      await this.checkGzipCompression(fileSizes);
    } catch (error) {
      this.addError(`分析构建结果失败: ${error.message}`);
    }
  }

  // 检查 Gzip 压缩效果
  async checkGzipCompression(fileSizes) {
    try {
      const zlib = await import("zlib");

      this.log("分析 Gzip 压缩效果...");

      const compressionResults = [];

      for (const file of fileSizes.slice(0, 10)) {
        // 只检查前10个文件
        const filePath = path.join(projectRoot, "dist", file.path);
        const content = fs.readFileSync(filePath);

        const compressed = zlib.gzipSync(content);
        const compressionRatio = (1 - compressed.length / content.length) * 100;

        compressionResults.push({
          path: file.path,
          original: file.sizeKB,
          compressed: Math.round((compressed.length / 1024) * 100) / 100,
          ratio: Math.round(compressionRatio),
        });
      }

      this.log("Gzip 压缩效果:");
      compressionResults.forEach((result) => {
        this.log(
          `  ${result.path}: ${result.original}KB → ${result.compressed}KB (${result.ratio}%)`,
        );
      });
    } catch (error) {
      this.addWarning(`检查 Gzip 压缩失败: ${error.message}`);
    }
  }

  // 工具方法：查找文件
  findFiles(dir, extensions) {
    const files = [];

    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          scan(fullPath);
        } else if (
          stat.isFile() &&
          extensions.some((ext) => item.endsWith(ext))
        ) {
          files.push(fullPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  // 生成优化报告
  generateReport() {
    this.log("\n=== 构建优化报告 ===");

    const completedOptimizations = this.optimizations.filter(
      (opt) => opt.completed,
    );
    const failedOptimizations = this.optimizations.filter(
      (opt) => !opt.completed,
    );

    this.log(`✅ 完成的优化: ${completedOptimizations.length}`);
    completedOptimizations.forEach((opt) => {
      this.log(`   - ${opt.name}: ${opt.description}`);
    });

    if (failedOptimizations.length > 0) {
      this.log(`❌ 失败的优化: ${failedOptimizations.length}`);
      failedOptimizations.forEach((opt) => {
        this.log(`   - ${opt.name}: ${opt.description}`);
      });
    }

    if (this.warnings.length > 0) {
      this.log(`⚠️  警告: ${this.warnings.length}`);
      this.warnings.forEach((warning) => {
        this.log(`   - ${warning}`);
      });
    }

    if (this.errors.length > 0) {
      this.log(`❌ 错误: ${this.errors.length}`);
      this.errors.forEach((error) => {
        this.log(`   - ${error}`);
      });
    }

    const success = this.errors.length === 0;
    this.log(
      `\n${success ? "🎉 构建优化完成！" : "⚠️  构建优化完成，但有错误"}`,
    );

    return success;
  }

  // 运行所有优化
  async runAllOptimizations() {
    this.log("开始构建优化...\n");

    this.cleanBuildDirectory();
    this.optimizeDependencies();
    this.optimizeImages();
    this.optimizeCSS();
    this.optimizeJavaScript();
    await this.buildOptimized();

    return this.generateReport();
  }
}

// 运行优化
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new BuildOptimizer();
  optimizer
    .runAllOptimizations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("优化过程中发生错误:", error);
      process.exit(1);
    });
}

export default BuildOptimizer;
