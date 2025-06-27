/**
 * 状态栏调试脚本
 * 检查状态栏组件是否正确渲染和显示
 */

console.log("🔍 开始检查状态栏组件...\n");

// 检查状态栏元素是否存在
function checkStatusBarElement() {
  console.log("1. 检查状态栏 DOM 元素...");

  const statusBar = document.querySelector(".status-bar");
  if (statusBar) {
    console.log("✅ 状态栏元素存在");

    // 检查样式
    const styles = window.getComputedStyle(statusBar);
    console.log(`   位置: ${styles.position}`);
    console.log(`   底部距离: ${styles.bottom}`);
    console.log(`   z-index: ${styles.zIndex}`);
    console.log(`   高度: ${styles.height}`);
    console.log(`   背景: ${styles.background}`);
    console.log(`   显示状态: ${styles.display}`);
    console.log(`   可见性: ${styles.visibility}`);

    // 检查是否在视口内
    const rect = statusBar.getBoundingClientRect();
    console.log(
      `   位置信息: top=${rect.top}, bottom=${rect.bottom}, height=${rect.height}`,
    );
    console.log(`   视口高度: ${window.innerHeight}`);

    if (rect.bottom > window.innerHeight) {
      console.log("⚠️  状态栏可能在视口外");
    } else {
      console.log("✅ 状态栏在视口内");
    }

    return true;
  } else {
    console.log("❌ 状态栏元素不存在");
    return false;
  }
}

// 检查状态栏内容
function checkStatusBarContent() {
  console.log("\n2. 检查状态栏内容...");

  const statusContent = document.querySelector(".status-content");
  if (statusContent) {
    console.log("✅ 状态栏内容容器存在");

    const leftSection = statusContent.querySelector(".status-left");
    const centerSection = statusContent.querySelector(".status-center");
    const rightSection = statusContent.querySelector(".status-right");

    console.log(`   左侧区域: ${leftSection ? "存在" : "不存在"}`);
    console.log(`   中间区域: ${centerSection ? "存在" : "不存在"}`);
    console.log(`   右侧区域: ${rightSection ? "存在" : "不存在"}`);

    // 检查状态项
    const statusItems = statusContent.querySelectorAll(".status-item");
    console.log(`   状态项数量: ${statusItems.length}`);

    statusItems.forEach((item, index) => {
      const text = item.querySelector(".status-text");
      if (text) {
        console.log(`   状态项 ${index + 1}: ${text.textContent}`);
      }
    });

    return true;
  } else {
    console.log("❌ 状态栏内容容器不存在");
    return false;
  }
}

// 检查可能的遮挡元素
function checkOverlappingElements() {
  console.log("\n3. 检查可能的遮挡元素...");

  const statusBar = document.querySelector(".status-bar");
  if (!statusBar) return false;

  const rect = statusBar.getBoundingClientRect();
  const elementsAtPosition = document.elementsFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );

  console.log("   在状态栏位置的元素:");
  elementsAtPosition.forEach((el, index) => {
    const styles = window.getComputedStyle(el);
    console.log(
      `   ${index + 1}. ${el.tagName.toLowerCase()}${el.className ? "." + el.className.split(" ").join(".") : ""} (z-index: ${styles.zIndex})`,
    );
  });

  return true;
}

// 检查 Vue 组件挂载
function checkVueComponent() {
  console.log("\n4. 检查 Vue 组件挂载...");

  // 检查 Vue 应用是否存在
  const app = document.querySelector("#app");
  if (app) {
    console.log("✅ Vue 应用容器存在");

    // 检查是否有 Vue 相关的属性
    if (app.__vue__ || app._vnode) {
      console.log("✅ Vue 实例已挂载");
    } else {
      console.log("⚠️  无法检测到 Vue 实例");
    }
  } else {
    console.log("❌ Vue 应用容器不存在");
  }
}

// 主检查函数
function runStatusBarCheck() {
  console.log("📊 状态栏组件调试报告");
  console.log("=".repeat(50));

  const elementExists = checkStatusBarElement();
  const contentExists = checkStatusBarContent();
  checkOverlappingElements();
  checkVueComponent();

  console.log("\n📋 检查总结:");
  console.log("=".repeat(50));

  if (elementExists && contentExists) {
    console.log("✅ 状态栏组件基本正常");
    console.log("💡 如果仍然看不到状态栏，请检查:");
    console.log("   1. 浏览器缓存 (Ctrl+F5 强制刷新)");
    console.log("   2. 浏览器开发者工具中的元素检查");
    console.log("   3. 是否有其他元素遮挡");
  } else {
    console.log("❌ 状态栏组件存在问题");
    console.log("💡 建议检查:");
    console.log("   1. Vue 组件是否正确导入");
    console.log("   2. CSS 样式是否正确加载");
    console.log("   3. JavaScript 控制台是否有错误");
  }
}

// 如果在浏览器环境中运行
if (typeof window !== "undefined") {
  // 等待 DOM 加载完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runStatusBarCheck);
  } else {
    runStatusBarCheck();
  }
} else {
  console.log("此脚本需要在浏览器环境中运行");
  console.log("请在浏览器控制台中粘贴并执行此脚本");
}

// 导出检查函数供手动调用
if (typeof window !== "undefined") {
  window.checkStatusBar = runStatusBarCheck;
  console.log("\n💡 您也可以随时调用 checkStatusBar() 来重新检查状态栏");
}
