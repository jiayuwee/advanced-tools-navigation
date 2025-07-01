<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">服务条款</h1>
          <p class="mt-4 text-lg text-gray-600">
            请仔细阅读以下服务条款和使用协议
          </p>
          <p class="mt-2 text-sm text-gray-500">
            最后更新时间：{{ lastUpdated }}
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 目录 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">目录</h2>
        <nav class="space-y-2">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="block text-blue-600 hover:text-blue-800 transition-colors"
          >
            {{ section.title }}
          </a>
        </nav>
      </div>

      <!-- 条款内容 -->
      <div class="bg-white rounded-lg shadow-md p-8 space-y-12">
        <!-- 接受条款 -->
        <section id="acceptance">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">1. 接受条款</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              欢迎使用工具导航站（以下简称"本网站"或"我们"）。通过访问和使用本网站，您同意遵守并受以下服务条款的约束。如果您不同意这些条款，请不要使用本网站。
            </p>
            <p>
              我们保留随时修改这些条款的权利。修改后的条款将在本页面发布，并自发布之日起生效。您继续使用本网站即表示接受修改后的条款。
            </p>
          </div>
        </section>

        <!-- 服务描述 -->
        <section id="service-description">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">2. 服务描述</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              本网站是一个工具导航和产品展示平台，为用户提供以下服务：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>工具和资源的分类展示和搜索</li>
              <li>产品信息展示和购买服务</li>
              <li>用户账户管理和个人中心</li>
              <li>用户反馈和技术支持</li>
              <li>其他相关的增值服务</li>
            </ul>
            <p>
              我们努力确保服务的可用性和准确性，但不保证服务不会中断或完全无错误。
            </p>
          </div>
        </section>

        <!-- 用户责任 -->
        <section id="user-responsibilities">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">3. 用户责任</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              作为本网站的用户，您同意：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>提供真实、准确、完整的注册信息</li>
              <li>保护您的账户安全，不与他人共享登录凭据</li>
              <li>遵守所有适用的法律法规</li>
              <li>不进行任何可能损害网站或其他用户的活动</li>
              <li>不上传恶意软件、病毒或其他有害内容</li>
              <li>尊重知识产权和他人权利</li>
            </ul>
            <p>
              您对通过您的账户进行的所有活动承担全部责任。
            </p>
          </div>
        </section>

        <!-- 知识产权 -->
        <section id="intellectual-property">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">4. 知识产权</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              本网站的所有内容，包括但不限于文本、图片、图标、软件、设计等，均受版权、商标和其他知识产权法律保护。
            </p>
            <p>
              除非另有说明，本网站的内容归我们或我们的许可方所有。未经明确书面许可，您不得：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>复制、修改、分发或展示网站内容</li>
              <li>创建衍生作品</li>
              <li>进行商业使用</li>
              <li>逆向工程或反编译</li>
            </ul>
          </div>
        </section>

        <!-- 隐私政策 -->
        <section id="privacy">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">5. 隐私保护</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              我们重视您的隐私保护。我们收集、使用和保护您的个人信息的方式详见我们的隐私政策。
            </p>
            <p>
              通过使用本网站，您同意我们按照隐私政策收集和使用您的信息。
            </p>
            <p>
              我们采取合理的安全措施保护您的个人信息，但无法保证绝对安全。
            </p>
          </div>
        </section>

        <!-- 付费服务 -->
        <section id="paid-services">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">6. 付费服务</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              本网站可能提供付费产品和服务。对于付费服务：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>所有价格均以人民币计价，除非另有说明</li>
              <li>付款完成后，您将获得相应的产品或服务访问权限</li>
              <li>退款政策将根据具体产品或服务而定</li>
              <li>我们保留随时修改价格的权利</li>
            </ul>
            <p>
              您有责任支付所有适用的税费。
            </p>
          </div>
        </section>

        <!-- 免责声明 -->
        <section id="disclaimer">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">7. 免责声明</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              本网站按"现状"提供服务，我们不提供任何明示或暗示的保证，包括但不限于：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>服务的可用性、准确性或可靠性</li>
              <li>服务满足您的特定需求</li>
              <li>服务不会中断或无错误</li>
              <li>通过服务获得的信息的准确性</li>
            </ul>
            <p>
              您使用本网站的风险由您自行承担。
            </p>
          </div>
        </section>

        <!-- 责任限制 -->
        <section id="limitation-of-liability">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">8. 责任限制</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              在法律允许的最大范围内，我们不对以下情况承担责任：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>任何间接、偶然、特殊或后果性损害</li>
              <li>利润损失、数据丢失或业务中断</li>
              <li>第三方内容或服务造成的损害</li>
              <li>不可抗力事件造成的损失</li>
            </ul>
            <p>
              我们的总责任不超过您在过去12个月内向我们支付的费用。
            </p>
          </div>
        </section>

        <!-- 服务终止 -->
        <section id="termination">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">9. 服务终止</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              我们保留在以下情况下暂停或终止您的账户的权利：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>违反本服务条款</li>
              <li>进行欺诈或非法活动</li>
              <li>长期不活跃的账户</li>
              <li>其他我们认为必要的情况</li>
            </ul>
            <p>
              您也可以随时删除您的账户。账户终止后，您将失去对服务的访问权限。
            </p>
          </div>
        </section>

        <!-- 适用法律 -->
        <section id="governing-law">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">10. 适用法律</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              本服务条款受中华人民共和国法律管辖。任何争议应通过友好协商解决。
            </p>
            <p>
              如协商不成，争议应提交至我们所在地有管辖权的人民法院解决。
            </p>
          </div>
        </section>

        <!-- 联系信息 -->
        <section id="contact">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">11. 联系我们</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p>
              如果您对本服务条款有任何疑问，请通过以下方式联系我们：
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>邮箱：support@ramusi.cn</li>
              <li>电话：+86 400-123-4567</li>
              <li>地址：中国 北京市 朝阳区 xxx街道 xxx号</li>
            </ul>
          </div>
        </section>
      </div>

      <!-- 底部导航 -->
      <div class="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">相关文档</h3>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link
            to="/privacy-policy"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shield class="w-4 h-4 mr-2" />
            隐私政策
          </router-link>
          <router-link
            to="/contact"
            class="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            <MessageCircle class="w-4 h-4 mr-2" />
            联系我们
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Shield, MessageCircle } from 'lucide-vue-next'

// 最后更新时间
const lastUpdated = ref('2024年1月1日')

// 目录数据
const sections = ref([
  { id: 'acceptance', title: '1. 接受条款' },
  { id: 'service-description', title: '2. 服务描述' },
  { id: 'user-responsibilities', title: '3. 用户责任' },
  { id: 'intellectual-property', title: '4. 知识产权' },
  { id: 'privacy', title: '5. 隐私保护' },
  { id: 'paid-services', title: '6. 付费服务' },
  { id: 'disclaimer', title: '7. 免责声明' },
  { id: 'limitation-of-liability', title: '8. 责任限制' },
  { id: 'termination', title: '9. 服务终止' },
  { id: 'governing-law', title: '10. 适用法律' },
  { id: 'contact', title: '11. 联系我们' }
])

// 设置页面标题
document.title = '服务条款 - 工具导航站'
</script>
