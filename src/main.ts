import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router/index'
import './style.css'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

// 注册插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')
