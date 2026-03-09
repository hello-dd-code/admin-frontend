import { createRouter, createWebHistory } from 'vue-router'

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
        component: () => import('../views/watermark/index.vue'),
        meta: { title: '去水印管理', icon: 'Brush' }
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
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
