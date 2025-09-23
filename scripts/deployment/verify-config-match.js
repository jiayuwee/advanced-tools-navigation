// 配置匹配验证脚本
import { readFileSync } from "fs";

console.log("🔍 验证项目配置匹配性");
console.log("=====================================");

// 预期的配置值（基于用户的实际项目）
const expectedConfig = {
  github: {
    owner: "jiayuwee",
    repo: "advanced-tools-navigation",
  },
  netlify: {
    siteId: "spiffy-torrone-5454e1",
    domain: "ramusi.cn",
  },
  supabase: {
    projectRef: "ndmxwdejswybvbwrxsai",
  url: "https://your-supabase-project.supabase.co",
  },
};

// 需要检查的文件和配置
const configFiles = [
  {
    path: ".github/workflows/deploy.yml",
    checks: [
      { pattern: /ramusi\.cn/, expected: "ramusi.cn", description: "域名配置" },
      {
        pattern: /spiffy-torrone-5454e1/,
        expected: "spiffy-torrone-5454e1",
        description: "Netlify 站点 ID",
      },
    ],
  },
  {
    path: ".github/workflows/supabase-deploy-fixed.yml",
    checks: [
      { pattern: /ramusi\.cn/, expected: "ramusi.cn", description: "域名配置" },
      {
        pattern: /jiayuwee/,
        expected: "jiayuwee",
        description: "GitHub 用户名",
      },
      {
        pattern: /advanced-tools-navigation/,
        expected: "advanced-tools-navigation",
        description: "仓库名称",
      },
    ],
  },
  {
    path: "netlify.toml",
    checks: [
      {
        pattern: /ramusi\.cn/,
        expected: "ramusi.cn",
        description: "域名重定向配置",
      },
    ],
  },
  {
    path: "supabase/config.toml",
    checks: [
      {
        pattern: /ramusi\.cn/,
        expected: "ramusi.cn",
        description: "认证重定向 URL",
      },
      {
        pattern: /spiffy-torrone-5454e1\.netlify\.app/,
        expected: "spiffy-torrone-5454e1.netlify.app",
        description: "Netlify 备用 URL",
      },
    ],
  },
  {
    path: "public/CNAME",
    checks: [
      {
        pattern: /ramusi\.cn/,
        expected: "ramusi.cn",
        description: "CNAME 域名",
      },
    ],
  },
];

function checkFile(filePath, checks) {
  try {
    const content = readFileSync(filePath, "utf8");
    const results = [];

    console.log(`\n📄 检查文件: ${filePath}`);

    for (const check of checks) {
      const matches = content.match(check.pattern);
      if (matches) {
        console.log(`  ✅ ${check.description}: 找到匹配项`);
        results.push({ ...check, status: "found", matches });
      } else {
        console.log(`  ❌ ${check.description}: 未找到匹配项`);
        results.push({ ...check, status: "missing" });
      }
    }

    return results;
  } catch (error) {
    console.log(`  ⚠️  无法读取文件: ${error.message}`);
    return checks.map((check) => ({
      ...check,
      status: "error",
      error: error.message,
    }));
  }
}

function checkScriptFiles() {
  console.log("\n🔧 检查脚本文件中的配置");

  const scriptChecks = [
    {
      file: "scripts/deployment/check-github-secrets.js",
      expectedValues: [
        "ndmxwdejswybvbwrxsai",
        "fytiwsutzgmygfxnqoft.supabase.co",
      ],
    },
    {
      file: "scripts/deployment/monitor-deployment.js",
      expectedValues: [
        "jiayuwee",
        "advanced-tools-navigation",
        "ramusi.cn",
        "spiffy-torrone-5454e1",
        "ndmxwdejswybvbwrxsai",
      ],
    },
  ];

  for (const check of scriptChecks) {
    try {
      const content = readFileSync(check.file, "utf8");
      console.log(`\n📄 检查: ${check.file}`);

      for (const value of check.expectedValues) {
        if (content.includes(value)) {
          console.log(`  ✅ 找到配置: ${value}`);
        } else {
          console.log(`  ❌ 缺失配置: ${value}`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  无法读取文件: ${error.message}`);
    }
  }
}

function generateConfigSummary() {
  console.log("\n📋 配置总结");
  console.log("=====================================");
  console.log("根据您的项目，以下是正确的配置值：");
  console.log("");

  console.log("🔐 GitHub Secrets 应该配置为：");
  console.log(`- SUPABASE_PROJECT_REF: ${expectedConfig.supabase.projectRef}`);
  console.log(`- VITE_SUPABASE_URL: ${expectedConfig.supabase.url}`);
  console.log("- SUPABASE_ACCESS_TOKEN: [从 Supabase Dashboard 获取]");
  console.log("- VITE_SUPABASE_ANON_KEY: [从 Supabase Dashboard 获取]");
  console.log("");

  console.log("🌐 域名和部署配置：");
  console.log(`- 主域名: ${expectedConfig.netlify.domain}`);
  console.log(`- Netlify 站点: ${expectedConfig.netlify.siteId}`);
  console.log(
    `- GitHub 仓库: ${expectedConfig.github.owner}/${expectedConfig.github.repo}`,
  );
  console.log("");

  console.log("🗄️ Supabase 项目配置：");
  console.log(`- 项目引用 ID: ${expectedConfig.supabase.projectRef}`);
  console.log(`- API URL: ${expectedConfig.supabase.url}`);
  console.log(
    `- 控制台: https://supabase.com/dashboard/project/${expectedConfig.supabase.projectRef}`,
  );
}

function checkEnvironmentVariables() {
  console.log("\n🔍 检查环境变量配置");

  // 检查是否有 .env.local 文件
  try {
    const envContent = readFileSync(".env.local", "utf8");
    console.log("✅ 找到 .env.local 文件");

    // 检查关键配置
    if (envContent.includes(expectedConfig.supabase.url)) {
      console.log("✅ VITE_SUPABASE_URL 配置正确");
    } else {
      console.log("❌ VITE_SUPABASE_URL 可能不正确");
      console.log(`   应该是: ${expectedConfig.supabase.url}`);
    }

    if (envContent.includes("VITE_SUPABASE_ANON_KEY")) {
      console.log("✅ VITE_SUPABASE_ANON_KEY 已配置");
    } else {
      console.log("❌ VITE_SUPABASE_ANON_KEY 未配置");
    }
  } catch (error) {
    console.log("⚠️  未找到 .env.local 文件");
    console.log("   请创建此文件并添加 Supabase 配置");
  }
}

// 运行所有检查
console.log("开始验证配置匹配性...\n");

// 检查配置文件
let totalChecks = 0;
let passedChecks = 0;

for (const configFile of configFiles) {
  const results = checkFile(configFile.path, configFile.checks);
  totalChecks += results.length;
  passedChecks += results.filter((r) => r.status === "found").length;
}

// 检查脚本文件
checkScriptFiles();

// 检查环境变量
checkEnvironmentVariables();

// 生成配置总结
generateConfigSummary();

// 最终结果
console.log("\n🎯 验证结果");
console.log("=====================================");
console.log(`配置文件检查: ${passedChecks}/${totalChecks} 通过`);

if (passedChecks === totalChecks) {
  console.log("🎉 所有配置都正确匹配您的项目！");
} else {
  console.log("⚠️  部分配置可能需要调整");
  console.log("请检查上述标记为 ❌ 的项目");
}

console.log("");
console.log("📝 下一步操作：");
console.log("1. 确认 GitHub Secrets 已正确配置");
console.log("2. 运行 npm run secrets:check 验证配置");
console.log("3. 运行 npm run test:deployment 测试部署流程");
console.log("4. 提交代码触发自动部署");
