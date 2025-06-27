// GitHub Secrets 配置检查和指导脚本
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔐 GitHub Secrets 配置检查");
console.log("=====================================");

// 检查 GitHub Secrets 配置指南
function checkSecretsConfiguration() {
  const requiredSecrets = [
    {
      name: "SUPABASE_ACCESS_TOKEN",
      description: "Supabase 访问令牌",
      howToGet:
        "从 Supabase Dashboard > Settings > API > Personal access tokens 获取",
    },
    {
      name: "SUPABASE_PROJECT_REF",
      description: "项目引用 ID",
      howToGet: "从项目 URL 中获取，您的项目 ID: ndmxwdejswybvbwrxsai",
    },
    {
      name: "VITE_SUPABASE_URL",
      description: "项目 API URL",
      howToGet:
        "从 Supabase Dashboard > Settings > API 获取，您的 URL: https://fytiwsutzgmygfxnqoft.supabase.co",
    },
    {
      name: "VITE_SUPABASE_ANON_KEY",
      description: "项目匿名密钥",
      howToGet: "从 Supabase Dashboard > Settings > API 获取",
    },
  ];

  console.log("📋 需要配置的 GitHub Secrets:");
  console.log("");

  requiredSecrets.forEach((secret, index) => {
    console.log(`${index + 1}. ${secret.name}`);
    console.log(`   描述: ${secret.description}`);
    console.log(`   获取方式: ${secret.howToGet}`);
    console.log("");
  });

  console.log("🔧 配置步骤:");
  console.log(
    "1. 访问 GitHub 仓库: https://github.com/jiayuwee/advanced-tools-navigation",
  );
  console.log('2. 点击 "Settings" 标签页');
  console.log('3. 在左侧菜单中点击 "Secrets and variables" > "Actions"');
  console.log('4. 点击 "New repository secret" 按钮');
  console.log('5. 输入 Secret 名称和值，然后点击 "Add secret"');
  console.log("6. 重复步骤 4-5 添加所有必需的 secrets");
  console.log("");

  // 检查本地环境变量
  console.log("🔍 本地环境变量检查:");
  if (supabaseUrl && supabaseKey) {
    console.log("✅ 本地环境变量已配置");
    console.log(`   VITE_SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(
      `   VITE_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`,
    );

    // 测试连接
    testSupabaseConnection();
  } else {
    console.log("❌ 本地环境变量未配置");
    console.log("   请检查 .env.local 文件中的配置");
    console.log("");
    console.log("📝 .env.local 文件示例（使用您的实际配置）:");
    console.log("VITE_SUPABASE_URL=https://fytiwsutzgmygfxnqoft.supabase.co");
    console.log("VITE_SUPABASE_ANON_KEY=your-actual-anon-key");
  }
}

async function testSupabaseConnection() {
  try {
    console.log("");
    console.log("🧪 测试 Supabase 连接...");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 测试基本连接
    const { data, error } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ 数据库连接失败:", error.message);
      console.log("   请检查 URL 和密钥是否正确");
    } else {
      console.log("✅ 数据库连接正常");
      console.log("   配置的环境变量可以正常使用");
    }
  } catch (error) {
    console.error("❌ 连接测试失败:", error.message);
  }
}

function showWorkflowInfo() {
  console.log("");
  console.log("⚙️ 工作流信息");
  console.log("=====================================");
  console.log("当前项目有以下主要工作流:");
  console.log("");
  console.log("1. 📦 deploy.yml - 主要部署工作流");
  console.log("   - 触发条件: 推送到 main 分支");
  console.log("   - 功能: 构建和部署到 Netlify");
  console.log("   - 不需要 Supabase secrets");
  console.log("");
  console.log("2. 🗄️ supabase-deploy-fixed.yml - Supabase 部署工作流");
  console.log("   - 触发条件: supabase/ 目录变更或手动触发");
  console.log("   - 功能: 部署数据库迁移和前端");
  console.log("   - 需要所有 Supabase secrets");
  console.log("");
  console.log("3. 🧪 ci.yml - 持续集成工作流");
  console.log("   - 触发条件: 推送和 PR");
  console.log("   - 功能: 代码检查和构建测试");
  console.log("   - 不需要 secrets");
  console.log("");
  console.log("🔗 查看工作流运行状态:");
  console.log("https://github.com/jiayuwee/advanced-tools-navigation/actions");
}

function showTroubleshooting() {
  console.log("");
  console.log("🔧 故障排除");
  console.log("=====================================");
  console.log("如果工作流失败，请检查:");
  console.log("");
  console.log("1. ❌ Secrets 未配置或配置错误");
  console.log("   - 确认所有必需的 secrets 都已添加");
  console.log("   - 检查 secret 值是否正确（无多余空格）");
  console.log("");
  console.log("2. ❌ Supabase 项目问题");
  console.log('   - 确认项目状态为 "Active"');
  console.log("   - 检查项目引用 ID 是否正确");
  console.log("   - 验证访问令牌权限");
  console.log("");
  console.log("3. ❌ 网络或权限问题");
  console.log("   - 检查 GitHub Actions 是否启用");
  console.log("   - 确认仓库权限设置正确");
  console.log("");
  console.log("📞 获取帮助:");
  console.log("- GitHub Actions 文档: https://docs.github.com/en/actions");
  console.log("- Supabase 文档: https://supabase.com/docs");
  console.log(
    "- 项目 Issues: https://github.com/jiayuwee/advanced-tools-navigation/issues",
  );
}

// 运行检查
console.log("开始检查 GitHub Secrets 配置...");
console.log("");

checkSecretsConfiguration();
showWorkflowInfo();
showTroubleshooting();

console.log("");
console.log("✅ 检查完成！");
console.log("请按照上述指南配置 GitHub Secrets，然后测试工作流运行。");
