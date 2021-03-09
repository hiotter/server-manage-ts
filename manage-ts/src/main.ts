import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import { message } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import router from './router'
import store from './store'


export const app = createApp(App)
app.use(Antd)
// app.use(ant)
app.config.globalProperties.$store = store
app.config.globalProperties.$message = message // 全局注册一个message组件
app.provide('$message', message)
app.provide('$baseURL', process.env.VUE_APP_URL)
app.provide('$imgBaseUrl', process.env.VUE_APP_IMG_URL)

//自定义指令
app.directive('permission', {
    mounted(el, binding) {
        const type = binding.arg === 'btn' ? 'buttonsAuths' : 'contentsAuths'
        if (!store.state.userInfo.role[type].includes(binding.value) && store.state.userInfo.role.name !==
            '管理员') {
            el.parentNode.removeChild(el)
        }
    }
})

app.use(router)
app.use(store)
app.mount('#app')
