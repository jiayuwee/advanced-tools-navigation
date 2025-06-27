#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证项目配置、依赖、测试等是否准备就绪
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PreDeployChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.resolve(__dirname, "../..");
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

  addError(message) {
    this.errors.push(message);
    this.log(message, "error");
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, "warning");
  }

  // 检查项目文件结构
  checkProjectStructure() {
    this.log("检查项目文件结构...");

    const requiredFiles = [
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "src/main.ts",
      "src/App.vue",
      "index.html",
    ];

    const requiredDirs = [
      "src",
      "src/components",
      "src/views",
      "src/stores",
      "src/services",
      "src/composables",
      "src/types",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        this.addError(`缺少必需文件: ${file}`);
      }
    }

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        this.addError(`缺少必需目录: ${dir}`);
      }
    }

    this.log("项目文件结构检查完成", "success");
  }

  // 检查 package.json 配置
  checkPackageJson() {
    this.log("检查 package.json 配置...");

    const packagePath = path.join(this.projectRoot, "package.json");
    if (!fs.existsSync(packagePath)) {
      this.addError("package.json 文件不存在");
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      // 检查必需的脚本
      const requiredScripts = ["build", "dev", "preview", "test", "test:run"];
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.addError(`缺少必需的脚本: ${script}`);
        }
      }

      // 检查必需的依赖
      const requiredDeps = [
        "vue",
        "vue-router",
        "pinia",
        "@supabase/supabase-js",
      ];
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
          this.addError(`缺少必需的依赖: ${dep}`);
        }
      }

      // 检查开发依赖
      const requiredDevDeps = [
        "vite",
        "typescript",
        "vitest",
        "@vue/test-utils",
      ];
      for (const dep of requiredDevDeps) {
        if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
          this.addWarning(`缺少推荐的开发依赖: ${dep}`);
        }
      }

      this.log("package.json 配置检查完成", "success");
    } catch (error) {
      this.addError(`解析 package.json 失败: ${error.message}`);
    }
  }

  // 检查环境变量配置
  checkEnvironmentConfig() {
    this.log("检查环境变量配置...");

    const envExamplePath = path.join(this.projectRoot, ".env.example");
    if (!fs.existsSync(envExamplePath)) {
      this.addWarning(".env.example 文件不存在");
      return;
    }

    try {
      const envExample = fs.readFileSync(envExamplePath, "utf8");

      // 检查必需的环境变量
      const requiredEnvVars = [
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY",
        "VITE_APP_NAME",
        "VITE_APP_URL",
      ];

      for (const envVar of requiredEnvVars) {
        if (!envExample.includes(envVar)) {
          this.addError(`缺少必需的环境变量配置: ${envVar}`);
        }
      }

      this.log("环境变量配置检查完成", "success");
    } catch (error) {
      this.addError(`读取 .env.example 失败: ${error.message}`);
    }
  }

  // 检查 TypeScript 配置
  checkTypeScriptConfig() {
    this.log("检查 TypeScript 配置...");

    const tsconfigPath = path.join(this.projectRoot, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
      this.addError("tsconfig.json 文件不存在");
      return;
    }

    try {
      // 运行 TypeScript 类型检查
      execSync("npx vue-tsc --noEmit", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });
      this.log("TypeScript 类型检查通过", "success");
    } catch (error) {
      this.addError(`TypeScript 类型检查失败: ${error.message}`);
    }
  }

  // 检查代码质量
  checkCodeQuality() {
    this.log("检查代码质量...");

    try {
      // 运行 ESLint
      execSync("npx eslint src --ext .ts,.vue", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });
      this.log("ESLint 检查通过", "success");
    } catch (error) {
      this.addWarning(`ESLint 检查发现问题: ${error.message}`);
    }
  }

  // 运行测试
  runTests() {
    this.log("运行测试套件...");

    try {
      // 运行单元测试
      execSync("npm run test:run", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });
      this.log("所有测试通过", "success");
    } catch (error) {
      this.addError(`测试失败: ${error.message}`);
    }
  }

  // 检查构建
  checkBuild() {
    this.log("检查构建配置...");

    try {
      // 运行构建
      execSync("npm run build", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });

      // 检查构建输出
      const distPath = path.join(this.projectRoot, "dist");
      if (!fs.existsSync(distPath)) {
        this.addError("构建输出目录不存在");
        return;
      }

      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        this.addError("构建输出缺少 index.html");
        return;
      }

      // 检查构建文件大小
      const stats = fs.statSync(indexPath);
      if (stats.size === 0) {
        this.addError("index.html 文件为空");
        return;
      }

      this.log("构建检查通过", "success");
    } catch (error) {
      this.addError(`构建失败: ${error.message}`);
    }
  }

  // 检查依赖安全性
  checkDependencySecurity() {
    this.log("检查依赖安全性...");

    try {
      execSync("npm audit --audit-level=high", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });
      this.log("依赖安全检查通过", "success");
    } catch (error) {
      this.addWarning(`发现安全漏洞: ${error.message}`);
    }
  }

  // 检查新功能模块
  checkNewFeatures() {
    this.log("检查新功能模块...");

    const newFeatureFiles = [
      "src/services/searchService.ts",
      "src/services/reviewService.ts",
      "src/services/notificationService.ts",
      "src/services/performanceService.ts",
      "src/services/databaseService.ts",
      "src/composables/useTheme.ts",
      "src/composables/useRealtime.ts",
      "src/composables/usePerformance.ts",
      "src/components/search/EnhancedSearchBox.vue",
      "src/components/notifications/NotificationCenter.vue",
      "src/components/theme/ThemeSelector.vue",
      "src/components/reviews/ProductReviews.vue",
    ];

    for (const file of newFeatureFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        this.addWarning(`新功能文件缺失: ${file}`);
      }
    }

    this.log("新功能模块检查完成", "success");
  }

  // 生成报告
  generateReport() {
    this.log("\n=== 部署前检查报告 ===");

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log("🎉 所有检查通过，项目已准备好部署！", "success");
      return true;
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ 发现 ${this.errors.length} 个错误:`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  发现 ${this.warnings.length} 个警告:`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (this.errors.length > 0) {
      this.log("\n❌ 部署前检查失败，请修复错误后重试", "error");
      return false;
    } else {
      this.log("\n⚠️  检查通过但有警告，建议修复后部署", "warning");
      return true;
    }
  }

  // 运行所有检查
  async runAllChecks() {
    this.log("开始部署前检查...\n");

    this.checkProjectStructure();
    this.checkPackageJson();
    this.checkEnvironmentConfig();
    this.checkTypeScriptConfig();
    this.checkCodeQuality();
    this.runTests();
    this.checkBuild();
    this.checkDependencySecurity();
    this.checkNewFeatures();

    return this.generateReport();
  }
}

// 运行检查
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PreDeployChecker();
  checker
    .runAllChecks()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("检查过程中发生错误:", error);
      process.exit(1);
    });
}

export default PreDeployChecker;
