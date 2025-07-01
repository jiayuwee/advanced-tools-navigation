<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>系统设置</h1>
      <p>管理网站配置和内容</p>
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
            />
          </div>
          <div class="form-group">
            <label>网站描述</label>
            <textarea
              v-model="siteConfig.description"
              placeholder="专注于为用户提供优质的工具导航和产品展示服务"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>联系邮箱</label>
            <input
              v-model="siteConfig.contact.email"
              type="email"
              placeholder="contact@example.com"
            />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input
              v-model="siteConfig.contact.phone"
              type="tel"
              placeholder="+86 138-0000-0000"
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
            ></textarea>
          </div>
          <div class="form-group">
            <label>版权信息</label>
            <input
              v-model="footerConfig.copyright"
              type="text"
              placeholder="© 2024 工具导航站. 保留所有权利."
            />
          </div>
        </div>
        
        <!-- 统计数据 -->
        <div class="stats-config">
          <h3>底部统计数据</h3>
          <div class="stats-grid">
            <div class="stat-config">
              <label>精选工具数</label>
              <input
                v-model.number="footerConfig.stats.toolsCount"
                type="number"
                min="0"
              />
            </div>
            <div class="stat-config">
              <label>工具分类数</label>
              <input
                v-model.number="footerConfig.stats.categoriesCount"
                type="number"
                min="0"
              />
            </div>
            <div class="stat-config">
              <label>用户使用数</label>
              <input
                v-model.number="footerConfig.stats.usersCount"
                type="number"
                min="0"
              />
            </div>
          </div>
        </div>

        <!-- 社交链接 -->
        <div class="social-config">
          <h3>社交媒体链接</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>微信</label>
              <input
                v-model="footerConfig.social.wechat"
                type="text"
                placeholder="微信号或二维码链接"
              />
            </div>
            <div class="form-group">
              <label>微博</label>
              <input
                v-model="footerConfig.social.weibo"
                type="url"
                placeholder="https://weibo.com/..."
              />
            </div>
            <div class="form-group">
              <label>GitHub</label>
              <input
                v-model="footerConfig.social.github"
                type="url"
                placeholder="https://github.com/..."
              />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input
                v-model="footerConfig.social.email"
                type="email"
                placeholder="contact@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SEO设置 -->
      <div class="settings-section">
        <h2>SEO设置</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>页面标题</label>
            <input
              v-model="seoConfig.title"
              type="text"
              placeholder="工具导航站 - 高效工具导航平台"
            />
          </div>
          <div class="form-group">
            <label>页面描述</label>
            <textarea
              v-model="seoConfig.description"
              placeholder="发现和使用最优质的在线工具，提升工作效率"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>关键词</label>
            <input
              v-model="seoConfig.keywords"
              type="text"
              placeholder="工具导航,在线工具,效率工具,开发工具"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <button
          class="save-button"
          :disabled="saving"
          @click="saveSettings"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
        <button
          class="reset-button"
          @click="resetSettings"
        >
          重置为默认
        </button>
      </div>

      <!-- 消息提示 -->
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 响应式数据
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 网站配置
const siteConfig = ref({
  name: '工具导航站',
  description: '专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。',
  contact: {
    email: 'contact@ramusi.cn',
    phone: '+86 138-0000-0000'
  }
})

// 页面底部配置
const footerConfig = ref({
  companyDescription: '专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。',
  copyright: '© 2024 工具导航站. 保留所有权利.',
  stats: {
    toolsCount: 1000,
    categoriesCount: 50,
    usersCount: 10000
  },
  social: {
    wechat: '',
    weibo: '',
    github: 'https://github.com/jiayuwee/advanced-tools-navigation',
    email: 'contact@ramusi.cn'
  }
})

// SEO配置
const seoConfig = ref({
  title: '工具导航站 - 高效工具导航平台',
  description: '发现和使用最优质的在线工具，提升工作效率。精心挑选的工具分类，让您快速找到所需工具。',
  keywords: '工具导航,在线工具,效率工具,开发工具,设计工具,办公工具'
})

// 方法
const saveSettings = async () => {
  try {
    saving.value = true
    message.value = ''

    // 保存到localStorage（实际项目中应该保存到数据库）
    localStorage.setItem('siteConfig', JSON.stringify(siteConfig.value))
    localStorage.setItem('footerConfig', JSON.stringify(footerConfig.value))
    localStorage.setItem('seoConfig', JSON.stringify(seoConfig.value))

    message.value = '设置保存成功！'
    messageType.value = 'success'

    // 3秒后清除消息
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存设置失败:', error)
    message.value = '保存设置失败，请重试'
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  if (confirm('确定要重置为默认设置吗？这将清除所有自定义配置。')) {
    // 重置为默认值
    siteConfig.value = {
      name: '工具导航站',
      description: '专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。',
      contact: {
        email: 'contact@ramusi.cn',
        phone: '+86 138-0000-0000'
      }
    }

    footerConfig.value = {
      companyDescription: '专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。',
      copyright: '© 2024 工具导航站. 保留所有权利.',
      stats: {
        toolsCount: 1000,
        categoriesCount: 50,
        usersCount: 10000
      },
      social: {
        wechat: '',
        weibo: '',
        github: 'https://github.com/jiayuwee/advanced-tools-navigation',
        email: 'contact@ramusi.cn'
      }
    }

    seoConfig.value = {
      title: '工具导航站 - 高效工具导航平台',
      description: '发现和使用最优质的在线工具，提升工作效率。精心挑选的工具分类，让您快速找到所需工具。',
      keywords: '工具导航,在线工具,效率工具,开发工具,设计工具,办公工具'
    }

    message.value = '设置已重置为默认值'
    messageType.value = 'success'
  }
}

const loadSettings = () => {
  try {
    // 从localStorage加载设置
    const savedSiteConfig = localStorage.getItem('siteConfig')
    const savedFooterConfig = localStorage.getItem('footerConfig')
    const savedSeoConfig = localStorage.getItem('seoConfig')

    if (savedSiteConfig) {
      siteConfig.value = { ...siteConfig.value, ...JSON.parse(savedSiteConfig) }
    }
    if (savedFooterConfig) {
      footerConfig.value = { ...footerConfig.value, ...JSON.parse(savedFooterConfig) }
    }
    if (savedSeoConfig) {
      seoConfig.value = { ...seoConfig.value, ...JSON.parse(savedSeoConfig) }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 10px 0;
}

.settings-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 20px 0;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 20px 0 15px 0;
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
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-config {
  display: flex;
  flex-direction: column;
}

.stat-config label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.stat-config input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.save-button,
.reset-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button {
  background: #3b82f6;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #2563eb;
}

.save-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.reset-button {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.reset-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 14px;
}

.message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .settings-view {
    padding: 15px;
  }
  
  .settings-section {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
