<template>
  <div class="simple-settings-view">
    <div class="settings-header">
      <h1>网站内容设置</h1>
      <p>更新网站的基本信息和内容</p>
    </div>

    <div class="settings-content">
      <!-- 网站基本信息 -->
      <div class="settings-section">
        <h2>网站基本信息</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>网站名称</label>
            <input
              v-model="siteConfig.name"
              type="text"
              placeholder="工具导航站"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>网站描述</label>
            <textarea
              v-model="siteConfig.description"
              placeholder="专注于为用户提供优质的工具导航和产品展示服务"
              rows="3"
              @input="onInputChange"
            ></textarea>
          </div>
          <div class="form-group">
            <label>联系邮箱</label>
            <input
              v-model="siteConfig.contact.email"
              type="email"
              placeholder="jiayuwee@outlook.com"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input
              v-model="siteConfig.contact.phone"
              type="tel"
              placeholder="+86 19053267804"
              @input="onInputChange"
            />
          </div>
        </div>
      </div>

      <!-- 页面底部信息 -->
      <div class="settings-section">
        <h2>页面底部信息</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>公司简介</label>
            <textarea
              v-model="footerConfig.companyDescription"
              placeholder="专注于为用户提供优质的工具导航和产品展示服务..."
              rows="4"
              @input="onInputChange"
            ></textarea>
          </div>
          <div class="form-group">
            <label>版权信息</label>
            <input
              v-model="footerConfig.copyright"
              type="text"
              placeholder="© 2025 工具导航站. 保留所有权利."
              @input="onInputChange"
            />
          </div>
        </div>

        <!-- 统计数据 -->
        <h3>统计数据</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>精选工具数量</label>
            <input
              v-model.number="footerConfig.stats.toolsCount"
              type="number"
              placeholder="1000"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>工具分类数量</label>
            <input
              v-model.number="footerConfig.stats.categoriesCount"
              type="number"
              placeholder="50"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>用户使用数量</label>
            <input
              v-model.number="footerConfig.stats.usersCount"
              type="number"
              placeholder="10000"
              @input="onInputChange"
            />
          </div>
        </div>

        <!-- 社交媒体链接 -->
        <h3>社交媒体链接</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>GitHub 链接</label>
            <input
              v-model="footerConfig.social.github"
              type="url"
              placeholder="https://github.com/username/repo"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="footerConfig.social.email"
              type="email"
              placeholder="jiayuwee@outlook.com"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>微信链接</label>
            <input
              v-model="footerConfig.social.wechat"
              type="url"
              placeholder="微信二维码链接"
              @input="onInputChange"
            />
          </div>
          <div class="form-group">
            <label>微博链接</label>
            <input
              v-model="footerConfig.social.weibo"
              type="url"
              placeholder="https://weibo.com/username"
              @input="onInputChange"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <button class="save-button" :disabled="saving" @click="saveSettings">
          {{ saving ? "保存中..." : "保存设置" }}
        </button>
        <button class="reset-button" @click="resetSettings">重置为默认</button>
        <button class="test-button" @click="testData">测试数据</button>
      </div>

      <!-- 消息提示 -->
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 响应式数据
const saving = ref(false);
const message = ref("");
const messageType = ref<"success" | "error">("success");

// 网站配置
const siteConfig = ref({
  name: "工具导航站",
  description:
    "专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。",
  contact: {
    email: "jiayuwee@outlook.com",
    phone: "+86 19053267804",
  },
});

// 页面底部配置
const footerConfig = ref({
  companyDescription:
    "专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。",
  copyright: "© 2025 工具导航站. 保留所有权利.",
  stats: {
    toolsCount: 1000,
    categoriesCount: 50,
    usersCount: 10000,
  },
  social: {
    wechat: "",
    weibo: "",
    github: "https://github.com/jiayuwee/advanced-tools-navigation",
    email: "contact@ramusi.cn",
  },
});

// 方法
const onInputChange = () => {
  console.log("输入变化:", {
    siteConfig: siteConfig.value,
    footerConfig: footerConfig.value,
  });
};

const testData = () => {
  console.log("当前数据:", {
    siteConfig: siteConfig.value,
    footerConfig: footerConfig.value,
  });
  alert(
    `当前数据:\n网站名称: ${siteConfig.value.name}\n联系邮箱: ${siteConfig.value.contact.email}\n版权信息: ${footerConfig.value.copyright}`,
  );
};

const saveSettings = async () => {
  try {
    saving.value = true;
    message.value = "";

    // 保存到localStorage
    localStorage.setItem("siteConfig", JSON.stringify(siteConfig.value));
    localStorage.setItem("footerConfig", JSON.stringify(footerConfig.value));

    message.value = "设置保存成功！页面将自动刷新以显示更新内容。";
    messageType.value = "success";

    // 3秒后刷新页面以显示更新内容
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("保存设置失败:", error);
    message.value = "保存设置失败，请重试";
    messageType.value = "error";
  } finally {
    saving.value = false;
  }
};

const resetSettings = () => {
  if (confirm("确定要重置为默认设置吗？这将清除所有自定义配置。")) {
    // 重置为默认值
    siteConfig.value = {
      name: "工具导航站",
      description:
        "专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。",
      contact: {
        email: "jiayuwee@outlook.com",
        phone: "+86 19053267804",
      },
    };

    footerConfig.value = {
      companyDescription:
        "专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。",
      copyright: "© 2025 工具导航站. 保留所有权利.",
      stats: {
        toolsCount: 1000,
        categoriesCount: 50,
        usersCount: 10000,
      },
      social: {
        wechat: "",
        weibo: "",
        github: "https://github.com/jiayuwee/advanced-tools-navigation",
        email: "contact@ramusi.cn",
      },
    };

    message.value = "设置已重置为默认值";
    messageType.value = "success";
  }
};

const loadSettings = () => {
  try {
    // 从localStorage加载设置
    const savedSiteConfig = localStorage.getItem("siteConfig");
    const savedFooterConfig = localStorage.getItem("footerConfig");

    if (savedSiteConfig) {
      siteConfig.value = {
        ...siteConfig.value,
        ...JSON.parse(savedSiteConfig),
      };
    }
    if (savedFooterConfig) {
      footerConfig.value = {
        ...footerConfig.value,
        ...JSON.parse(savedFooterConfig),
      };
    }
  } catch (error) {
    console.error("加载设置失败:", error);
  }
};

// 生命周期
onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.simple-settings-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: 100vh;
}

.settings-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.settings-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.settings-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.settings-content {
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid #e9ecef;
}

.settings-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.settings-section h3 {
  margin: 30px 0 15px 0;
  color: #34495e;
  font-size: 1.2rem;
  font-weight: 500;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.settings-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 40px 0;
}

.save-button,
.reset-button,
.test-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-button {
  background: #6c757d;
  color: white;
}

.reset-button:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.test-button {
  background: #17a2b8;
  color: white;
}

.test-button:hover {
  background: #138496;
  transform: translateY(-2px);
}

.message {
  padding: 15px 20px;
  border-radius: 8px;
  margin: 20px 0;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .simple-settings-view {
    padding: 10px;
  }

  .settings-header h1 {
    font-size: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .settings-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
