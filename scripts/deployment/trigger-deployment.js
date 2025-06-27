// 手动触发 GitHub Actions 部署脚本
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const REPO_OWNER = "jiayuwee";
const REPO_NAME = "advanced-tools-navigation";

// 需要 GitHub token 来触发工作流
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("❌ 需要 GITHUB_TOKEN 环境变量来触发部署");
  console.log("请在 .env.local 文件中添加:");
  console.log("GITHUB_TOKEN=your_github_token");
  console.log("");
  console.log("获取 token: https://github.com/settings/tokens");
  console.log("需要权限: repo, workflow");
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

console.log("🚀 GitHub Actions 部署触发器");
console.log("=".repeat(50));

async function triggerDeployment() {
  try {
    // 获取可用的工作流
    console.log("📋 获取可用的工作流...");

    const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });

    const deployWorkflows = workflows.workflows.filter(
      (workflow) =>
        workflow.name.includes("Deploy") || workflow.name.includes("Supabase"),
    );

    if (deployWorkflows.length === 0) {
      console.log("❌ 没有找到部署相关的工作流");
      return;
    }

    console.log("📊 找到以下部署工作流:");
    deployWorkflows.forEach((workflow, index) => {
      console.log(`   ${index + 1}. ${workflow.name}`);
      console.log(`      文件: ${workflow.path}`);
      console.log(`      状态: ${workflow.state}`);
      console.log("");
    });

    // 选择 Supabase 部署工作流
    const supabaseWorkflow = deployWorkflows.find(
      (w) => w.name.includes("Supabase") || w.path.includes("supabase-deploy"),
    );

    if (!supabaseWorkflow) {
      console.log("❌ 没有找到 Supabase 部署工作流");
      return;
    }

    console.log(`🎯 选择工作流: ${supabaseWorkflow.name}`);

    // 检查工作流是否支持手动触发
    if (!supabaseWorkflow.path.includes("workflow_dispatch")) {
      // 需要检查工作流文件内容
      console.log("🔍 检查工作流配置...");
    }

    // 触发工作流
    console.log("🚀 触发部署...");

    const { data: dispatch } =
      await octokit.rest.actions.createWorkflowDispatch({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        workflow_id: supabaseWorkflow.id,
        ref: "main", // 部署 main 分支
        inputs: {
          force_deploy: "false",
          environment: "production",
        },
      });

    console.log("✅ 部署已触发！");
    console.log("");
    console.log("📊 部署信息:");
    console.log(`   工作流: ${supabaseWorkflow.name}`);
    console.log(`   分支: main`);
    console.log(`   环境: production`);
    console.log("");
    console.log("🔗 监控链接:");
    console.log(
      `   Actions 页面: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`,
    );
    console.log(
      `   工作流详情: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${supabaseWorkflow.id}`,
    );
    console.log("");
    console.log("⏱️  部署通常需要 3-5 分钟完成");
    console.log("🔔 您可以在 Actions 页面查看实时进度");

    // 等待一下然后检查状态
    console.log("");
    console.log("⏳ 等待工作流开始...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 检查最新的运行状态
    const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: supabaseWorkflow.id,
      per_page: 1,
    });

    if (runs.workflow_runs.length > 0) {
      const latestRun = runs.workflow_runs[0];
      console.log("📊 最新运行状态:");
      console.log(`   状态: ${latestRun.status}`);
      console.log(
        `   开始时间: ${new Date(latestRun.created_at).toLocaleString("zh-CN")}`,
      );
      console.log(`   运行链接: ${latestRun.html_url}`);
    }
  } catch (error) {
    console.error("❌ 触发部署时出错:", error.message);

    if (error.status === 404) {
      console.log("请确认仓库名称和工作流配置正确");
    } else if (error.status === 403) {
      console.log("请确认 GitHub token 有足够的权限 (repo, workflow)");
    } else if (error.status === 422) {
      console.log("工作流可能不支持手动触发，请检查 workflow_dispatch 配置");
    }

    console.log("");
    console.log("🔧 故障排除:");
    console.log("1. 确认 GITHUB_TOKEN 权限正确");
    console.log("2. 检查工作流文件是否包含 workflow_dispatch");
    console.log("3. 确认仓库访问权限");
  }
}

// 提供使用说明
function showUsage() {
  console.log("📖 使用说明:");
  console.log("");
  console.log("1. 设置 GitHub Token:");
  console.log("   - 访问: https://github.com/settings/tokens");
  console.log("   - 创建新 token，选择 repo 和 workflow 权限");
  console.log("   - 在 .env.local 中添加: GITHUB_TOKEN=your_token");
  console.log("");
  console.log("2. 运行脚本:");
  console.log("   node trigger-deployment.js");
  console.log("");
  console.log("3. 监控部署:");
  console.log(`   https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`);
  console.log("");
}

// 检查参数
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  showUsage();
  process.exit(0);
}

// 运行触发器
triggerDeployment().catch((error) => {
  console.error("❌ 脚本执行失败:", error.message);
  console.log("");
  showUsage();
  process.exit(1);
});
