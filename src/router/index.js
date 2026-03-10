import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { pinia } from '../stores'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'DataLine' }
      },
      {
        path: 'mini-programs',
        name: 'MiniPrograms',
        component: () => import('../views/mini-programs/index.vue'),
        meta: { title: '小程序管理', icon: 'Iphone' }
      },
      {
        path: 'mini-programs/create',
        name: 'MiniProgramCreate',
        component: () => import('../views/mini-programs/create.vue'),
        meta: { title: '添加小程序', hidden: true }
      },
      {
        path: 'mini-programs/:id/edit',
        name: 'MiniProgramEdit',
        component: () => import('../views/mini-programs/edit.vue'),
        meta: { title: '编辑小程序', hidden: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('../views/users/detail.vue'),
        meta: { title: '用户详情', hidden: true }
      },
      {
        path: 'marketing',
        name: 'Marketing',
        component: () => import('../views/marketing/index.vue'),
        meta: { title: '营销图管理', icon: 'Picture' }
      },
      {
        path: 'memberships',
        name: 'Memberships',
        component: () => import('../views/memberships/index.vue'),
        meta: { title: '会员管理', icon: 'Medal' }
      },
      {
        path: 'expiry',
        name: 'Expiry',
        component: () => import('../views/expiry/index.vue'),
        meta: { title: '保质期管理', icon: 'Box' }
      },
      {
        path: 'watermark',
        name: 'Watermark',
        component: () => import('../views/watermark/layout.vue'),
        redirect: '/watermark/video-parse-logs',
        meta: { title: '去水印小程序', icon: 'Brush' },
        children: [
          {
            path: 'video-parse-logs',
            name: 'VideoParseLogs',
            component: () => import('../views/watermark/video-parse-logs.vue'),
            meta: { title: '解析日志' }
          },
          {
            path: 'video-parse-unlocks',
            name: 'VideoParseUnlocks',
            component: () => import('../views/watermark/video-parse-unlocks.vue'),
            meta: { title: '广告解锁' }
          },
          {
            path: 'video-download-failures',
            name: 'VideoDownloadFailures',
            component: () => import('../views/watermark/video-download-failures.vue'),
            meta: { title: '下载失败上报' }
          }
        ]
      },
      {
        path: 'smoke',
        name: 'Smoke',
        component: () => import('../views/smoke/index.vue'),
        meta: { title: '戒烟小程序', icon: 'Opportunity' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore(pinia)
  const token = userStore.token

  if (!to.meta.requiresAuth) {
    if (to.path === '/login' && token) {
      try {
        await userStore.ensureProfileLoaded()
        next('/')
      } catch (error) {
        next()
      }
      return
    }
    next()
    return
  }

  if (!token) {
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    return
  }

  try {
    await userStore.ensureProfileLoaded()
    next()
  } catch (error) {
    userStore.logout()
    next('/login')
  }
})

export default router
