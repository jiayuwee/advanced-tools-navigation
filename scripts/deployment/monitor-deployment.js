// 部署状态监控和告警脚本
import { Octokit } from "@octokit/rest";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const REPO_OWNER = "jiayuwee";
const REPO_NAME = "advanced-tools-navigation";
const SITE_URL = "https://ramusi.cn";

// GitHub API 客户端
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // 可选
});

// Supabase 客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

console.log("📊 部署状态监控系统");
console.log("=====================================");

// 监控配置
const monitorConfig = {
  checkInterval: 5 * 60 * 1000, // 5分钟检查一次
  maxFailures: 3, // 连续失败3次后告警
  timeout: 30000, // 30秒超时
};

let failureCount = 0;
let lastCheckTime = null;
let monitoringActive = false;

// 监控检查项
const healthChecks = [
  {
    name: "网站可访问性",
    check: checkSiteHealth,
    critical: true,
  },
  {
    name: "GitHub Actions 状态",
    check: checkGitHubActions,
    critical: false,
  },
  {
    name: "Supabase 数据库",
    check: checkSupabaseHealth,
    critical: true,
  },
];

async function checkSiteHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      monitorConfig.timeout,
    );

    const response = await fetch(SITE_URL, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      status: "healthy",
      message: `网站正常响应 (${response.status})`,
      responseTime: Date.now() - lastCheckTime,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: `网站访问失败: ${error.message}`,
      error: error.message,
    };
  }
}

async function checkGitHubActions() {
  try {
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 5,
    });

    if (runs.total_count === 0) {
      return {
        status: "warning",
        message: "没有找到工作流运行记录",
      };
    }

    const latestRun = runs.workflow_runs[0];
    const failedRuns = runs.workflow_runs.filter(
      (run) => run.conclusion === "failure",
    ).length;

    if (latestRun.conclusion === "failure") {
      return {
        status: "unhealthy",
        message: `最新工作流失败: ${latestRun.name}`,
        details: {
          runId: latestRun.id,
          url: latestRun.html_url,
          failedCount: failedRuns,
        },
      };
    }

    return {
      status: "healthy",
      message: `工作流正常 (最新: ${latestRun.conclusion})`,
      details: {
        totalRuns: runs.total_count,
        failedRuns: failedRuns,
      },
    };
  } catch (error) {
    return {
      status: "warning",
      message: `GitHub API 访问失败: ${error.message}`,
    };
  }
}

async function checkSupabaseHealth() {
  if (!supabase) {
    return {
      status: "warning",
      message: "Supabase 配置未找到",
    };
  }

  try {
    const { error } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: "healthy",
      message: "数据库连接正常",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: `数据库连接失败: ${error.message}`,
      error: error.message,
    };
  }
}

async function runHealthChecks() {
  lastCheckTime = Date.now();
  const results = [];
  let criticalFailures = 0;

  console.log(`🔍 运行健康检查 (${new Date().toLocaleString("zh-CN")})`);
  console.log("-".repeat(50));

  for (const healthCheck of healthChecks) {
    try {
      const result = await healthCheck.check();
      results.push({
        name: healthCheck.name,
        critical: healthCheck.critical,
        ...result,
      });

      const statusIcon = getStatusIcon(result.status);
      console.log(`${statusIcon} ${healthCheck.name}: ${result.message}`);

      if (healthCheck.critical && result.status === "unhealthy") {
        criticalFailures++;
      }
    } catch (error) {
      const result = {
        name: healthCheck.name,
        critical: healthCheck.critical,
        status: "error",
        message: `检查失败: ${error.message}`,
        error: error.message,
      };

      results.push(result);
      console.log(`❌ ${healthCheck.name}: ${result.message}`);

      if (healthCheck.critical) {
        criticalFailures++;
      }
    }
  }

  // 更新失败计数
  if (criticalFailures > 0) {
    failureCount++;
  } else {
    failureCount = 0;
  }

  // 检查是否需要告警
  if (failureCount >= monitorConfig.maxFailures) {
    await triggerAlert(results, criticalFailures);
  }

  console.log("");
  console.log(
    `📊 检查完成 - 关键失败: ${criticalFailures}, 连续失败: ${failureCount}`,
  );

  return results;
}

async function triggerAlert(results, criticalFailures) {
  console.log("🚨 触发告警！");
  console.log("=====================================");
  console.log(`关键服务失败数: ${criticalFailures}`);
  console.log(`连续失败次数: ${failureCount}`);
  console.log("");

  console.log("📋 详细状态:");
  results.forEach((result) => {
    if (result.status === "unhealthy" || result.status === "error") {
      console.log(`❌ ${result.name}: ${result.message}`);
      if (result.error) {
        console.log(`   错误详情: ${result.error}`);
      }
    }
  });

  console.log("");
  console.log("🔧 建议的处理步骤:");
  console.log("1. 检查网站是否可以正常访问");
  console.log("2. 查看 GitHub Actions 工作流状态");
  console.log("3. 检查 Supabase 项目状态");
  console.log("4. 查看 Netlify 部署日志");
  console.log("");
  console.log("🔗 有用的链接:");
  console.log(`🌐 网站: ${SITE_URL}`);
  console.log(
    `📊 GitHub Actions: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`,
  );
  console.log(
    "📦 Netlify: https://app.netlify.com/sites/spiffy-torrone-5454e1/deploys",
  );
  console.log(
    "🗄️ Supabase: https://supabase.com/dashboard/project/ndmxwdejswybvbwrxsai",
  );
}

function getStatusIcon(status) {
  switch (status) {
    case "healthy":
      return "✅";
    case "warning":
      return "⚠️";
    case "unhealthy":
      return "❌";
    case "error":
      return "💥";
    default:
      return "❓";
  }
}

// 启动监控
async function startMonitoring() {
  if (monitoringActive) {
    console.log("⚠️  监控已在运行中");
    return;
  }

  monitoringActive = true;
  console.log("🚀 启动部署监控系统");
  console.log(`⏱️  检查间隔: ${monitorConfig.checkInterval / 1000}秒`);
  console.log(`🚨 告警阈值: 连续${monitorConfig.maxFailures}次失败`);
  console.log("");

  // 立即运行一次检查
  await runHealthChecks();

  // 设置定期检查
  const intervalId = setInterval(async () => {
    if (!monitoringActive) {
      clearInterval(intervalId);
      return;
    }
    await runHealthChecks();
  }, monitorConfig.checkInterval);

  console.log("📊 监控系统已启动，按 Ctrl+C 停止");
}

// 单次检查模式
async function runSingleCheck() {
  console.log("🔍 运行单次健康检查");
  console.log("");

  const results = await runHealthChecks();

  console.log("");
  console.log("📋 检查总结:");
  const healthy = results.filter((r) => r.status === "healthy").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const unhealthy = results.filter(
    (r) => r.status === "unhealthy" || r.status === "error",
  ).length;

  console.log(`✅ 正常: ${healthy}`);
  console.log(`⚠️  警告: ${warnings}`);
  console.log(`❌ 异常: ${unhealthy}`);

  if (unhealthy > 0) {
    console.log("");
    console.log("🔧 需要关注的问题:");
    results
      .filter((r) => r.status === "unhealthy" || r.status === "error")
      .forEach((result) => {
        console.log(`- ${result.name}: ${result.message}`);
      });
  }
}

// 根据命令行参数决定运行模式
const args = process.argv.slice(2);
if (args.includes("--monitor") || args.includes("-m")) {
  startMonitoring().catch((error) => {
    console.error("❌ 监控启动失败:", error.message);
    process.exit(1);
  });
} else {
  runSingleCheck().catch((error) => {
    console.error("❌ 健康检查失败:", error.message);
    process.exit(1);
  });
}
