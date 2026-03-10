<template>
  <el-container class="layout-container">
    <div
      v-if="isMobile && mobileMenuVisible"
      class="mobile-mask"
      @click="closeMobileMenu"
    ></div>

    <el-aside :width="asideWidth" class="sidebar" :class="{ 'sidebar-mobile': isMobile }">
      <div class="logo">
        <span v-if="!isCollapse">管理后台</span>
        <span v-else>后台</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="menuCollapse"
        :unique-opened="true"
        router
        @select="handleMenuSelect"
      >
        <template v-for="routeItem in menuRoutes" :key="routeKey(routeItem)">
          <el-sub-menu
            v-if="hasChildren(routeItem)"
            :index="resolvePath(routeItem.path)"
          >
            <template #title>
              <el-icon><component :is="routeItem.meta.icon" /></el-icon>
              <span>{{ routeItem.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in visibleChildren(routeItem)"
              :key="routeKey(child)"
              :index="resolvePath(routeItem.path, child.path)"
            >
              {{ child.meta?.title || child.name }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item
            v-else
            :index="resolvePath(routeItem.path)"
          >
            <el-icon><component :is="routeItem.meta.icon" /></el-icon>
            <template #title>{{ routeItem.meta.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userInfo?.username || 'Admin' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand, User, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const isMobile = ref(window.innerWidth < 768)
const mobileMenuVisible = ref(false)

const asideWidth = computed(() => {
  if (isMobile.value) {
    return mobileMenuVisible.value ? '200px' : '0px'
  }
  return isCollapse.value ? '64px' : '200px'
})

const menuCollapse = computed(() => {
  if (isMobile.value) {
    return false
  }
  return isCollapse.value
})

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  handleResize()

  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      // token 失效时，store 内会自动登出
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

watch(
  () => route.path,
  () => {
    if (isMobile.value) {
      closeMobileMenu()
    }
  }
)

const menuRoutes = computed(() => {
  const rootRoute = router.options.routes.find((item) => item.path === '/')
  if (!rootRoute || !rootRoute.children) return []
  return rootRoute.children.filter((item) => !item.meta?.hidden)
})

const visibleChildren = (routeItem) => {
  return (routeItem.children || []).filter((child) => !child.meta?.hidden)
}

const hasChildren = (routeItem) => {
  return visibleChildren(routeItem).length > 0
}

const routeKey = (routeItem) => {
  return `${routeItem.path || ''}-${routeItem.name || ''}`
}

const resolvePath = (parentPath = '', childPath = '') => {
  const normalize = (value) => {
    if (!value) return '/'
    return value.startsWith('/') ? value : `/${value}`
  }

  const parent = normalize(parentPath)
  if (!childPath) {
    return parent
  }
  if (childPath.startsWith('/')) {
    return childPath
  }
  return `${parent.replace(/\/$/, '')}/${childPath}`.replace(/\/{2,}/g, '/')
}

const activeMenu = computed(() => {
  const { path } = route
  if (path === '/watermark') {
    return '/watermark/video-parse-logs'
  }
  if (path.includes('/create') || path.includes('/edit') || /\/\d+$/.test(path)) {
    return '/' + path.split('/')[1]
  }
  return path
})

const toggleCollapse = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = !mobileMenuVisible.value
    return
  }
  isCollapse.value = !isCollapse.value
}

const closeMobileMenu = () => {
  mobileMenuVisible.value = false
}

const handleMenuSelect = () => {
  if (isMobile.value) {
    closeMobileMenu()
  }
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    mobileMenuVisible.value = false
  }
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      // 用户取消
    }
  } else if (command === 'profile') {
    router.push({
      path: '/settings',
      query: { tab: 'profile' }
    })
  }
}
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.sidebar {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
  z-index: 1001;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #2b3a4b;
}

:deep(.el-menu) {
  border-right: none;
  background: transparent;
  --el-menu-bg-color: #304156;
  --el-menu-text-color: #bfcbd9;
  --el-menu-hover-bg-color: #263445;
  --el-menu-active-color: #ffffff;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: #263445 !important;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: #409eff !important;
  color: #fff;
}

:deep(.el-menu--inline) {
  background: linear-gradient(180deg, #27374a 0%, #243244 100%) !important;
  padding: 6px 0 10px;
}

:deep(.el-menu--inline .el-menu-item) {
  min-width: auto;
  margin: 4px 10px;
  border-radius: 8px;
  color: #d7e2ee;
}

:deep(.el-menu--inline .el-menu-item:hover) {
  background: #33475e !important;
}

:deep(.el-menu--inline .el-menu-item.is-active) {
  background: #1f8fff !important;
  color: #fff;
}

:deep(.el-menu--popup) {
  background: #263445 !important;
  border: 1px solid #3b4d63;
}

:deep(.el-menu--popup .el-menu-item) {
  color: #d7e2ee;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background: #33475e !important;
}

:deep(.el-menu--popup .el-menu-item.is-active) {
  background: #1f8fff !important;
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.mobile-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

@media (max-width: 767px) {
  .sidebar-mobile {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
  }

  .header {
    padding: 0 12px;
  }

  .main-content {
    padding: 12px;
  }
}
</style>
