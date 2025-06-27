import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { setupRouterGuard } from "./permission";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 设置路由守卫
setupRouterGuard();

// 初始化本地管理功能
import { useLocalManagementStore } from "./stores/localManagement";
const localStore = useLocalManagementStore();
localStore.initialize();

app.mount("#app");
