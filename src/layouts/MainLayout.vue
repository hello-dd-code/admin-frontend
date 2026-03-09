<template>
  <el-container class="layout-container">
    <div
      v-if="isMobile && mobileMenuVisible"
      class="mobile-mask"
      @click="closeMobileMenu"
    ></div>

    <!-- 侧边栏 -->
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
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航栏 -->
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

      <!-- 主内容 -->
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

// 获取菜单路由（过滤掉隐藏的路由）
const menuRoutes = computed(() => {
  const routes = router.getRoutes()
  const mainRoute = routes.find(r => r.path === '/')
  if (!mainRoute || !mainRoute.children) return []

  return mainRoute.children.filter(r => !r.meta?.hidden)
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route
  // 如果是子路由，返回父路由路径
  if (path.includes('/create') || path.includes('/edit') || /\/\d+$/.test(path)) {
    return '/' + path.split('/')[1]
  }
  return path
})

// 切换侧边栏折叠状态
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

// 处理下拉菜单命令
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
    ElMessage.info('个人信息功能开发中...')
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

.el-menu {
  border-right: none;
  background: #304156;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background: #263445 !important;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: #409eff !important;
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
