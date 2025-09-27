// Netlify 部署状态检查脚本
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const REPO_OWNER = "jiayuwee";
const REPO_NAME = "advanced-tools-navigation";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

console.log("🔍 检查 Netlify 和构建状态...");

async function checkNetlifyStatus() {
  try {
    // 获取最近的工作流运行
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 15,
    });

    console.log(`📊 找到 ${runs.total_count} 个工作流运行记录\n`);

    // 过滤出最近的构建和部署工作流
    const buildRuns = runs.workflow_runs.filter(run => 
      run.name.includes("Build") || 
      run.name.includes("Deploy") ||
      run.name.includes("Netlify")
    ).slice(0, 8);

    console.log("🚀 最近的构建和部署状态:");
    console.log("=".repeat(80));

    for (const run of buildRuns) {
      const status = getStatusIcon(run.status, run.conclusion);
      const duration = run.updated_at
        ? Math.round((new Date(run.updated_at) - new Date(run.created_at)) / 1000)
        : "未知";

      console.log(`${status} ${run.name}`);
      console.log(`   分支: ${run.head_branch}`);
      console.log(`   状态: ${run.status} ${run.conclusion ? `(${run.conclusion})` : ""}`);
      console.log(`   时间: ${new Date(run.created_at).toLocaleString("zh-CN")}`);
      console.log(`   耗时: ${duration}秒`);
      console.log(`   提交: ${run.head_sha.substring(0, 7)}`);
      console.log(`   链接: ${run.html_url}`);
      
      // 如果是失败的运行，获取详细信息
      if (run.conclusion === "failure") {
        console.log("   📋 查看详细日志:");
        await getJobLogs(run.id);
      }
      
      console.log("");
    }

    // 查找最新的commit对应的所有运行
    const latestCommit = runs.workflow_runs[0]?.head_sha;
    if (latestCommit) {
      console.log(`🔍 提交 ${latestCommit.substring(0, 7)} 的所有工作流:`);
      console.log("-".repeat(60));
      
      const commitRuns = runs.workflow_runs.filter(run => run.head_sha === latestCommit);
      for (const run of commitRuns) {
        const status = getStatusIcon(run.status, run.conclusion);
        console.log(`${status} ${run.name} - ${run.status} ${run.conclusion ? `(${run.conclusion})` : ""}`);
      }
      console.log("");
    }

  } catch (error) {
    console.error("❌ 检查状态时出错:", error.message);
  }
}

async function getJobLogs(runId) {
  try {
    const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      run_id: runId,
    });

    for (const job of jobs.jobs) {
      if (job.conclusion === "failure") {
        console.log(`     ❌ 失败的作业: ${job.name}`);
        console.log(`        时间: ${new Date(job.started_at).toLocaleString("zh-CN")}`);
        console.log(`        链接: ${job.html_url}`);
        
        // 获取作业步骤信息
        if (job.steps) {
          const failedSteps = job.steps.filter(step => step.conclusion === "failure");
          for (const step of failedSteps) {
            console.log(`        📍 失败步骤: ${step.name}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`     ⚠️ 无法获取作业详情: ${error.message}`);
  }
}

function getStatusIcon(status, conclusion) {
  if (status === "completed") {
    switch (conclusion) {
      case "success": return "✅";
      case "failure": return "❌";
      case "cancelled": return "⏹️";
      case "skipped": return "⏭️";
      default: return "❓";
    }
  } else if (status === "in_progress") {
    return "⏳";
  } else if (status === "queued") {
    return "⏸️";
  } else {
    return "❓";
  }
}

// 运行检查
checkNetlifyStatus().catch((error) => {
  console.error("❌ 脚本执行失败:", error.message);
  process.exit(1);
});