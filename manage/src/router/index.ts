import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { staticRoutes, asyncRoutes, notFoundRoute } from './routes'
import store from '../store'
const timeLocalStorage = window.localStorage
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ showSpinner: false })
import { message } from 'ant-design-vue'



const router = createRouter({
    history: createWebHashHistory(),
    routes: staticRoutes
})

// 渲染导航栏
function getValidRoutes(routes: RouteRecordRaw[], role: string, auths: string[]) {
    const arr = []
    for (const item of routes) {
        const itemNew = { ...item }

        if (role === '管理员' || auths.includes(itemNew.name ? itemNew.name.toString() : '')) {
            if (itemNew.children) {
                itemNew.children = getValidRoutes(itemNew.children, role, auths)
            }
            arr.push(itemNew)
        }
    }
    return arr
}

// 获取有效路由
function renderMenu(routes: RouteRecordRaw[]) {
    return routes.filter(route => (route.meta && route.meta.hidden == true) ? !route.meta.hidden : true)
        .map(route => {
            if (route.meta && route.children && route.children[0].meta) {
                const justOneChild = route.children.length === 1
                if (justOneChild) {
                    return {
                        icon: route.children[0].meta.icon,
                        title: route.children[0].meta.title,
                        name: route.children[0].name
                    }
                }
                return {
                    icon: route.meta.icon,
                    title: route.meta.title,
                    name: route.name,
                    children: route.children.filter(child => (route.meta && route.meta.hidden == true) ? false : true).map(child => {
                         if (child.meta) {
                            return {
                                icon: child.meta.icon,
                                title: child.meta.title,
                                name: child.name
                            }
                        }
                    })
                }
            }
        })
}

router.beforeEach(async (to, from) => {
    NProgress.start()
    if (to.path === '/login') {
        store.commit('CLEAR_PERMISSION')
        return true
    } else {
        const token = timeLocalStorage.getItem('token')
        if (store.state.token || token) {
            if (!store.state.token) store.commit('STORE_TOKEN', token)
            if (store.state.addRoutesDone) {
                if (to.path === '/') {
                    router.push({ path: '/console/dashboard' })
                } else {
                    return true
                }
            } else {
                try {
                    const { role, routesAuths } = await store.dispatch('__getUserInfo')
                    const validRoutes = getValidRoutes(asyncRoutes, role, routesAuths)
                    // resetRouter()
                    const routes: RouteRecordRaw[] = [...validRoutes, notFoundRoute]
                    routes.map((route) => {
                        router.addRoute(route)
                    })
                    store.commit('SET_ADD_ROUTES_DONE')
                    store.commit('STORE_MENU', renderMenu(validRoutes))
                    router.push({ ...to, replace: true })
                } catch (err) {
                    store.commit('CLEAR_PERMISSION')
                    router.push({ path: '/login' })
                    message.error(err.message)
                }
            }
        } else {
            store.commit('CLEAR_PERMISSION')
            router.push({ path: '/login' })
        }
    }
})

router.afterEach(async (to, from) => {
    NProgress.done()
})

export default router

// 重置路由
// function resetRouter() {
//     const reset = createRouter()
//     router.matcher = reset.matcher
// }
