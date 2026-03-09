<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <span>用户详情</span>
        <el-button @click="goBack">返回列表</el-button>
      </div>
    </template>

    <el-skeleton v-if="loading" :rows="8" animated />
    <el-empty v-else-if="!detail.id" description="用户不存在或已删除" />
    <div v-else class="detail-wrap">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="用户ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detail.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar :src="detail.avatar || detail.avatar_url" :size="36" />
        </el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderLabel(detail.gender) }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ maskPhone(detail.phone || detail.mobile) }}</el-descriptions-item>
        <el-descriptions-item label="OpenID">{{ detail.open_id || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="所属小程序" :column="2" border>
        <el-descriptions-item label="小程序ID">
          {{ detail.mini_program_id || detail.mini_program?.id || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="小程序名称">
          {{ detail.mini_program_name || detail.mini_program?.name || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="会员信息" :column="2" border>
        <el-descriptions-item label="会员状态">
          <el-tag :type="memberInfo.is_member ? 'success' : 'info'">
            {{ memberInfo.is_member ? '会员' : '非会员' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="套餐类型">
          {{ memberInfo.package_type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          {{ formatDateTime(memberInfo.expires_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatDateTime(detail.created_at || detail.registered_at) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-card class="stats-card" shadow="never">
        <template #header>
          <span>数据统计</span>
        </template>
        <el-empty v-if="statsEntries.length === 0" description="暂无统计数据" />
        <el-row v-else :gutter="12">
          <el-col
            v-for="item in statsEntries"
            :key="item.key"
            :xs="12"
            :sm="8"
            :md="6"
          >
            <div class="stat-item">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </el-card>
</template>

<script setup>
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserById } from '../../api/user'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = reactive({})
const memberInfo = reactive({
  is_member: false,
  package_type: '',
  expires_at: ''
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const maskPhone = (value) => {
  if (!value || String(value).length < 7) return value || '-'
  const phone = String(value)
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

const genderLabel = (gender) => {
  if (gender === 1 || gender === '1') return '男'
  if (gender === 2 || gender === '2') return '女'
  return '未知'
}

const statsEntries = computed(() => {
  const stats = detail.stats || {}
  return Object.keys(stats).map((key) => ({
    key,
    label: key,
    value: stats[key]
  }))
})

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getUserById(route.params.id)
    const payload = res.data || {}
    const user = payload.user || payload
    Object.assign(detail, user)

    const membership = payload.membership || user.membership || {}
    memberInfo.is_member = !!(user.is_member || membership.is_member)
    memberInfo.package_type = membership.package_type || membership.plan_name || ''
    memberInfo.expires_at = membership.expires_at || membership.ends_at || ''
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/users')
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-card {
  border: 1px solid #ebeef5;
}

.stat-item {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 12px;
}

.stat-label {
  color: #909399;
  font-size: 13px;
}

.stat-value {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
</style>
