// 部署诊断脚本 - 基于 Context7 最佳实践
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "jiayuwee";
const REPO_NAME = "advanced-tools-navigation";

if (!GITHUB_TOKEN) {
  console.error("❌ 请设置 GITHUB_TOKEN 环境变量");
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function diagnoseDeploy() {
  console.log("🔍 开始部署诊断 (基于 Context7 最佳实践)...\n");

  try {
    // 1. 检查最新的工作流运行
    console.log("📊 检查 GitHub Actions 状态...");
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 10,
    });

    const failedRuns = runs.workflow_runs.filter(
      (run) => run.conclusion === "failure",
    );

    if (failedRuns.length > 0) {
      console.log(`❌ 发现 ${failedRuns.length} 个失败的工作流:`);
      failedRuns.slice(0, 3).forEach((run) => {
        console.log(`   - ${run.name}: ${run.html_url}`);
      });
    } else {
      console.log("✅ 最近的工作流运行都成功了");
    }

    // 2. 网络连接诊断 (Context7 推荐方法)
    console.log("\n🌐 网络连接诊断...");
    const endpoints = [
      "https://ramusi.cn",
      "https://api.github.com/zen",
      "https://api.netlify.com/api/v1/sites",
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 测试 ${endpoint}...`);
        const response = await fetch(endpoint, {
          method: "HEAD",
          timeout: 10000,
        });
        console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    // 3. 检查 Supabase 连接 (Context7 验证模式)
    console.log("\n🗄️ 检查 Supabase 连接...");
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        console.log(`✅ Supabase 连接: ${healthCheck.status}`);
      } catch (error) {
        console.log(`❌ Supabase 连接失败: ${error.message}`);
      }
    } else {
      console.log("⚠️ Supabase 环境变量未配置");
    }

    // 4. 检查构建输出和依赖
    console.log("\n📦 检查构建状态...");
    try {
      const fs = await import("fs");
      const path = await import("path");
      
      // 检查关键文件
      const criticalFiles = [
        "package.json",
        "netlify.toml", 
        "dist/index.html",
        ".env.local"
      ];

      criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} 存在`);
        } else {
          console.log(`❌ ${file} 不存在`);
        }
      });

      // 检查 node_modules
      if (fs.existsSync("node_modules")) {
        console.log("✅ node_modules 存在");
      } else {
        console.log("❌ node_modules 不存在，请运行 npm install");
      }

    } catch (error) {
      console.log("⚠️ 无法检查文件系统");
    }

    // 5. Context7 推荐的故障排除步骤
    console.log("\n🔧 Context7 故障排除建议:");
    console.log("=====================================");
    console.log("1. 🌐 网络和域名问题:");
    console.log("   - 检查 DNS 解析: nslookup ramusi.cn");
    console.log("   - 验证 SSL 证书: curl -vI https://ramusi.cn");
    console.log("   - 测试 Netlify 连接性");
    console.log("");
    console.log("2. 🔧 Netlify 配置检查:");
    console.log("   - 访问 Netlify Dashboard");
    console.log("   - 确认站点状态为 'Published'");
    console.log("   - 检查构建日志是否有错误");
    console.log("   - 验证环境变量配置");
    console.log("");
    console.log("3. 📦 构建和部署流程:");
    console.log("   - 本地测试: npm run build && npm run preview");
    console.log("   - 检查 GitHub Actions 日志");
    console.log("   - 验证 netlify.toml 配置");
    console.log("");
    console.log("4. 🗄️ Supabase 集成:");
    console.log("   - 验证项目状态: Active");
    console.log("   - 检查 API 密钥有效性");
    console.log("   - 测试数据库连接");

  } catch (error) {
    console.error("❌ 诊断过程中出错:", error.message);
    console.log("\n🔍 详细错误信息:");
    console.log(error.stack);
  }
}

// 添加网络诊断函数
async function networkDiagnostics() {
  console.log("\n🔍 执行网络诊断 (Context7 方法)...");
  
  const diagnosticCommands = [
    "ping -c 4 ramusi.cn",
    "nslookup ramusi.cn", 
    "curl -I https://ramusi.cn"
  ];

  console.log("💡 建议手动执行以下命令进行网络诊断:");
  diagnosticCommands.forEach(cmd => {
    console.log(`   ${cmd}`);
  });
}

diagnoseDeploy().then(() => {
  networkDiagnostics();
});
