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
              <h3>工具导航站</h3>
              <p>让工作更高效</p>
            </div>
          </div>
          <p class="company-description">
            专注于为用户提供优质的工具导航和产品展示服务，致力于提升工作效率，让每个人都能找到最适合的工具和产品。
          </p>
          <div class="social-links">
            <a href="#" class="social-link" title="微信">
              <MessageCircleIcon class="icon" />
            </a>
            <a href="#" class="social-link" title="微博">
              <TwitterIcon class="icon" />
            </a>
            <a href="#" class="social-link" title="GitHub">
              <GithubIcon class="icon" />
            </a>
            <a href="#" class="social-link" title="邮箱">
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
            <li><a href="#">使用指南</a></li>
            <li><a href="#">常见问题</a></li>
            <li><a href="#">意见反馈</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">服务条款</a></li>
          </ul>
        </div>

        <!-- 联系信息 -->
        <div class="footer-section contact-info">
          <h4>联系我们</h4>
          <div class="contact-item">
            <PhoneIcon class="contact-icon" />
            <span>400-123-4567</span>
          </div>
          <div class="contact-item">
            <MailIcon class="contact-icon" />
            <span>contact@ramusi.cn</span>
          </div>
          <div class="contact-item">
            <MapPinIcon class="contact-icon" />
            <span>北京市朝阳区科技园区</span>
          </div>
          <div class="contact-item">
            <ClockIcon class="contact-icon" />
            <span>工作时间：9:00-18:00</span>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>&copy; 2024 工具导航站. 保留所有权利.</p>
            <p>
              <a href="#">隐私政策</a> | <a href="#">服务条款</a> |
              <a href="#">网站地图</a>
            </p>
          </div>
          <div class="footer-stats">
            <div class="stat-item">
              <span class="stat-number">1000+</span>
              <span class="stat-label">精选工具</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50+</span>
              <span class="stat-label">工具分类</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">10000+</span>
              <span class="stat-label">用户使用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {
  MessageCircleIcon,
  TwitterIcon,
  GithubIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from "lucide-vue-next";
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

.contact-info .contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.contact-icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
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
