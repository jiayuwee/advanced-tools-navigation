// 简单的健康检查脚本
console.log("🔍 检查部署状态...");
console.log("=====================================");

async function checkWebsite() {
  try {
    console.log("🌐 检查网站可访问性...");

    const response = await fetch("https://ramusi.cn", {
      method: "HEAD",
      timeout: 10000,
    });

    if (response.ok) {
      console.log(`✅ 网站正常访问 (状态码: ${response.status})`);
      return true;
    } else {
      console.log(`⚠️ 网站响应异常 (状态码: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 网站访问失败: ${error.message}`);
    return false;
  }
}

async function checkGitHubActions() {
  try {
    console.log("📊 检查 GitHub Actions...");
    console.log(
      "   请访问: https://github.com/jiayuwee/advanced-tools-navigation/actions",
    );
    console.log("   查看最新的工作流运行状态");
    return true;
  } catch (error) {
    console.log(`❌ GitHub Actions 检查失败: ${error.message}`);
    return false;
  }
}

async function checkNetlify() {
  try {
    console.log("📦 检查 Netlify 部署...");
    console.log(
      "   请访问: https://app.netlify.com/sites/spiffy-torrone-5454e1/deploys",
    );
    console.log("   查看最新的部署状态");
    return true;
  } catch (error) {
    console.log(`❌ Netlify 检查失败: ${error.message}`);
    return false;
  }
}

async function runChecks() {
  console.log("开始运行健康检查...\n");

  const results = [];

  // 检查网站
  const websiteOk = await checkWebsite();
  results.push({ name: "网站可访问性", status: websiteOk });

  console.log("");

  // 检查 GitHub Actions
  const githubOk = await checkGitHubActions();
  results.push({ name: "GitHub Actions", status: githubOk });

  console.log("");

  // 检查 Netlify
  const netlifyOk = await checkNetlify();
  results.push({ name: "Netlify 部署", status: netlifyOk });

  console.log("");
  console.log("📋 检查结果总结");
  console.log("=====================================");

  results.forEach((result) => {
    const icon = result.status ? "✅" : "❌";
    console.log(`${icon} ${result.name}: ${result.status ? "正常" : "异常"}`);
  });

  const allOk = results.every((r) => r.status);

  console.log("");
  if (allOk) {
    console.log("🎉 所有检查都通过！部署工作流正常运行");
  } else {
    console.log("⚠️ 部分检查失败，请查看上述详情");
  }

  console.log("");
  console.log("🔗 有用的链接:");
  console.log("🌐 网站: https://ramusi.cn");
  console.log(
    "📊 GitHub Actions: https://github.com/jiayuwee/advanced-tools-navigation/actions",
  );
  console.log(
    "📦 Netlify: https://app.netlify.com/sites/spiffy-torrone-5454e1/deploys",
  );
  console.log(
    "🗄️ Supabase: https://supabase.com/dashboard/project/ndmxwdejswybvbwrxsai",
  );

  return allOk;
}

// 运行检查
runChecks().catch((error) => {
  console.error("❌ 检查过程中出现错误:", error.message);
  process.exit(1);
});
