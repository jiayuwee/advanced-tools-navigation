<template>
  <div class="test-settings">
    <h1>测试设置页面</h1>
    
    <!-- 显示当前值 -->
    <div class="current-values">
      <h2>当前值显示</h2>
      <p>网站名称: {{ siteName }}</p>
      <p>网站描述: {{ siteDescription }}</p>
      <p>联系邮箱: {{ contactEmail }}</p>
      <p>联系电话: {{ contactPhone }}</p>
      <p>版权信息: {{ copyright }}</p>
    </div>

    <!-- 表单 -->
    <div class="form-section">
      <h2>修改设置</h2>
      
      <div class="form-group">
        <label>网站名称:</label>
        <input v-model="siteName" type="text" />
      </div>
      
      <div class="form-group">
        <label>网站描述:</label>
        <textarea v-model="siteDescription" rows="3"></textarea>
      </div>
      
      <div class="form-group">
        <label>联系邮箱:</label>
        <input v-model="contactEmail" type="email" />
      </div>
      
      <div class="form-group">
        <label>联系电话:</label>
        <input v-model="contactPhone" type="tel" />
      </div>
      
      <div class="form-group">
        <label>版权信息:</label>
        <input v-model="copyright" type="text" />
      </div>
      
      <div class="form-group">
        <label>精选工具数量:</label>
        <input v-model.number="toolsCount" type="number" />
      </div>
      
      <div class="form-group">
        <label>工具分类数量:</label>
        <input v-model.number="categoriesCount" type="number" />
      </div>
      
      <div class="form-group">
        <label>用户使用数量:</label>
        <input v-model.number="usersCount" type="number" />
      </div>
      
      <div class="form-group">
        <label>GitHub 链接:</label>
        <input v-model="githubLink" type="url" />
      </div>
      
      <div class="form-group">
        <label>社交邮箱:</label>
        <input v-model="socialEmail" type="email" />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="saveAllSettings" class="save-btn">保存所有设置</button>
      <button @click="loadSettings" class="load-btn">重新加载</button>
      <button @click="showCurrentData" class="test-btn">显示当前数据</button>
    </div>

    <!-- 消息 -->
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 单独的响应式变量
const siteName = ref('工具导航站')
const siteDescription = ref('专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。')
const contactEmail = ref('contact@ramusi.cn')
const contactPhone = ref('+86 138-0000-0000')
const copyright = ref('© 2024 工具导航站. 保留所有权利.')
const toolsCount = ref(1000)
const categoriesCount = ref(50)
const usersCount = ref(10000)
const githubLink = ref('https://github.com/jiayuwee/advanced-tools-navigation')
const socialEmail = ref('contact@ramusi.cn')

const message = ref('')

// 方法
const saveAllSettings = () => {
  try {
    const siteConfig = {
      name: siteName.value,
      description: siteDescription.value,
      contact: {
        email: contactEmail.value,
        phone: contactPhone.value
      }
    }

    const footerConfig = {
      copyright: copyright.value,
      stats: {
        toolsCount: toolsCount.value,
        categoriesCount: categoriesCount.value,
        usersCount: usersCount.value
      },
      social: {
        github: githubLink.value,
        email: socialEmail.value
      }
    }

    localStorage.setItem('siteConfig', JSON.stringify(siteConfig))
    localStorage.setItem('footerConfig', JSON.stringify(footerConfig))
    
    message.value = '设置保存成功！'
    
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存失败:', error)
    message.value = '保存失败，请重试'
  }
}

const loadSettings = () => {
  try {
    const savedSiteConfig = localStorage.getItem('siteConfig')
    const savedFooterConfig = localStorage.getItem('footerConfig')

    if (savedSiteConfig) {
      const siteConfig = JSON.parse(savedSiteConfig)
      siteName.value = siteConfig.name || siteName.value
      siteDescription.value = siteConfig.description || siteDescription.value
      contactEmail.value = siteConfig.contact?.email || contactEmail.value
      contactPhone.value = siteConfig.contact?.phone || contactPhone.value
    }

    if (savedFooterConfig) {
      const footerConfig = JSON.parse(savedFooterConfig)
      copyright.value = footerConfig.copyright || copyright.value
      toolsCount.value = footerConfig.stats?.toolsCount || toolsCount.value
      categoriesCount.value = footerConfig.stats?.categoriesCount || categoriesCount.value
      usersCount.value = footerConfig.stats?.usersCount || usersCount.value
      githubLink.value = footerConfig.social?.github || githubLink.value
      socialEmail.value = footerConfig.social?.email || socialEmail.value
    }

    message.value = '设置加载成功！'
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (error) {
    console.error('加载失败:', error)
    message.value = '加载失败'
  }
}

const showCurrentData = () => {
  const data = {
    siteName: siteName.value,
    siteDescription: siteDescription.value,
    contactEmail: contactEmail.value,
    contactPhone: contactPhone.value,
    copyright: copyright.value,
    toolsCount: toolsCount.value,
    categoriesCount: categoriesCount.value,
    usersCount: usersCount.value,
    githubLink: githubLink.value,
    socialEmail: socialEmail.value
  }
  
  console.log('当前数据:', data)
  alert(`当前数据:\n网站名称: ${siteName.value}\n联系邮箱: ${contactEmail.value}\n版权信息: ${copyright.value}`)
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.test-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: 100vh;
}

.current-values {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.current-values h2 {
  margin-top: 0;
  color: #2c3e50;
}

.current-values p {
  margin: 10px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #667eea;
}

.form-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 30px 0;
}

.save-btn,
.load-btn,
.test-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
}

.load-btn {
  background: #17a2b8;
  color: white;
}

.load-btn:hover {
  background: #138496;
}

.test-btn {
  background: #ffc107;
  color: #212529;
}

.test-btn:hover {
  background: #e0a800;
}

.message {
  padding: 15px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  text-align: center;
  margin: 20px 0;
}
</style>
