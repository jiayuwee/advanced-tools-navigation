<template>
  <footer class="app-footer">
    <div class="footer-content">
      <!-- 主要内容区域 -->
      <div class="footer-main">
        <!-- 公司信息 -->
        <div class="footer-section company-info">
          <div class="company-logo">
            <div class="logo-icon">🚀</div>
            <div class="logo-text">
              <h3>{{ siteConfig.name }}</h3>
              <p>让工作更高效</p>
            </div>
          </div>
          <p class="company-description">
            {{ footerConfig.companyDescription }}
          </p>
          <div class="social-links">
            <a
              v-if="footerConfig.social.wechat"
              :href="footerConfig.social.wechat"
              class="social-link"
              title="微信"
            >
              <MessageCircleIcon class="icon" />
            </a>
            <a
              v-if="footerConfig.social.weibo"
              :href="footerConfig.social.weibo"
              class="social-link"
              title="微博"
            >
              <TwitterIcon class="icon" />
            </a>
            <a
              v-if="footerConfig.social.github"
              :href="footerConfig.social.github"
              class="social-link"
              title="GitHub"
            >
              <GithubIcon class="icon" />
            </a>
            <a
              v-if="footerConfig.social.email"
              :href="`mailto:${footerConfig.social.email}`"
              class="social-link"
              title="邮箱"
            >
              <MailIcon class="icon" />
            </a>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <h4>快速导航</h4>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/tools">工具导航</router-link></li>
            <li><router-link to="/products">产品展示</router-link></li>
            <li><router-link to="/user/favorites">我的收藏</router-link></li>
            <li><router-link to="/admin">管理后台</router-link></li>
          </ul>
        </div>

        <!-- 产品服务 -->
        <div class="footer-section">
          <h4>产品服务</h4>
          <ul class="footer-links">
            <li><a href="#">开发工具</a></li>
            <li><a href="#">设计工具</a></li>
            <li><a href="#">效率工具</a></li>
            <li><a href="#">AI工具</a></li>
            <li><a href="#">学习资源</a></li>
          </ul>
        </div>

        <!-- 帮助支持 -->
        <div class="footer-section">
          <h4>帮助支持</h4>
          <ul class="footer-links">
            <li><router-link to="/help">帮助支持</router-link></li>
            <li><router-link to="/user-guide">使用指南</router-link></li>
            <li><router-link to="/faq">常见问题</router-link></li>
            <li><router-link to="/feedback">意见反馈</router-link></li>
            <li><router-link to="/contact">联系我们</router-link></li>
            <li><router-link to="/terms">服务条款</router-link></li>
          </ul>
        </div>

        <!-- 联系信息 -->
        <div class="footer-section contact-info">
          <h4>联系我们</h4>
          <div class="contact-card">
            <div
              v-if="siteConfig.contact.phone"
              class="contact-item phone-item"
              @click="handleContactClick('phone', siteConfig.contact.phone)"
            >
              <div class="contact-icon-wrapper">
                <PhoneIcon class="contact-icon" />
              </div>
              <div class="contact-content">
                <span class="contact-label">电话咨询</span>
                <span class="contact-value">{{
                  siteConfig.contact.phone
                }}</span>
              </div>
            </div>
            <div
              v-if="siteConfig.contact.email"
              class="contact-item email-item"
              @click="handleContactClick('email', siteConfig.contact.email)"
            >
              <div class="contact-icon-wrapper">
                <MailIcon class="contact-icon" />
              </div>
              <div class="contact-content">
                <span class="contact-label">邮箱联系</span>
                <span class="contact-value">{{
                  siteConfig.contact.email
                }}</span>
              </div>
            </div>
            <div class="contact-item address-item">
              <div class="contact-icon-wrapper">
                <MapPinIcon class="contact-icon" />
              </div>
              <div class="contact-content">
                <span class="contact-label">公司地址</span>
                <span class="contact-value">北京市朝阳区科技园区</span>
              </div>
            </div>
            <div class="contact-item hours-item">
              <div class="contact-icon-wrapper">
                <ClockIcon class="contact-icon" />
              </div>
              <div class="contact-content">
                <span class="contact-label">工作时间</span>
                <span class="contact-value">周一至周五 9:00-18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>{{ footerConfig.copyright }}</p>
            <p>
              <router-link to="/privacy-policy">隐私政策</router-link> |
              <router-link to="/terms">服务条款</router-link> |
              <router-link to="/sitemap">网站地图</router-link>
            </p>
          </div>
          <div class="footer-stats">
            <div class="stat-item">
              <span class="stat-number"
                >{{ footerConfig.stats.toolsCount }}+</span
              >
              <span class="stat-label">精选工具</span>
            </div>
            <div class="stat-item">
              <span class="stat-number"
                >{{ footerConfig.stats.categoriesCount }}+</span
              >
              <span class="stat-label">工具分类</span>
            </div>
            <div class="stat-item">
              <span class="stat-number"
                >{{ footerConfig.stats.usersCount }}+</span
              >
              <span class="stat-label">用户使用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  MessageCircleIcon,
  TwitterIcon,
  GithubIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from "lucide-vue-next";

// 响应式数据
const siteConfig = ref({
  name: "工具导航站",
  contact: {
    email: "contact@ramusi.cn",
    phone: "+86 400-888-0000",
  },
});

const footerConfig = ref({
  companyDescription:
    "专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。",
  copyright: "© 2024 工具导航站. 保留所有权利.",
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

// 处理联系方式点击
const handleContactClick = (type: string, value: string) => {
  switch (type) {
    case "phone":
      window.location.href = `tel:${value}`;
      break;
    case "email":
      window.location.href = `mailto:${value}`;
      break;
    default:
      break;
  }
};

// 加载配置
const loadConfig = () => {
  try {
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
    console.error("加载配置失败:", error);
  }
};

// 生命周期
onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 40px;
  padding: 60px 0 40px 0;
}

.footer-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: white;
}

.company-info .company-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.logo-text h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.logo-text p {
  font-size: 14px;
  margin: 4px 0 0 0;
  opacity: 0.8;
}

.company-description {
  line-height: 1.6;
  margin: 0 0 24px 0;
  opacity: 0.9;
  font-size: 14px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: white;
}

.contact-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  transition: all 0.3s ease;
  border-radius: 8px;
  cursor: pointer;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.contact-item.phone-item:hover,
.contact-item.email-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.contact-icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.contact-item:hover .contact-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.contact-icon {
  width: 20px;
  height: 20px;
  color: white;
  opacity: 0.9;
}

.contact-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.contact-label {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
  line-height: 1.4;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.copyright a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin: 0 4px;
}

.copyright a:hover {
  color: white;
}

.footer-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.icon {
  width: 20px;
  height: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 0 32px 0;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .footer-stats {
    gap: 20px;
  }

  .company-logo {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 0 16px;
  }

  .footer-main {
    padding: 32px 0 24px 0;
  }

  .footer-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
