<template>
  <div class="dashboard-page">
    <el-row :gutter="16" class="cards">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.total_mini_programs }}</div>
          <div class="card-label">小程序总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.total_users }}</div>
          <div class="card-label">用户总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.total_members }}</div>
          <div class="card-label">会员总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.today_new_users }}</div>
          <div class="card-label">今日新增用户</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="section-card">
      <template #header>
        <span>小程序统计</span>
      </template>
      <el-table v-loading="tableLoading" :data="miniProgramStats" stripe>
        <el-table-column prop="mini_program_id" label="ID" width="80" />
        <el-table-column prop="name" label="小程序" min-width="160" />
        <el-table-column prop="user_count" label="用户数" width="100" />
        <el-table-column prop="member_count" label="会员数" width="100" />
        <el-table-column prop="data_count" label="数据量" width="100" />
        <el-table-column prop="today_active" label="今日新增" width="100" />
      </el-table>
    </el-card>

    <el-card class="section-card">
      <template #header>
        <div class="growth-header">
          <span>用户增长趋势</span>
          <el-radio-group v-model="growthDays" size="small" @change="loadGrowth">
            <el-radio-button :value="7">近7天</el-radio-button>
            <el-radio-button :value="30">近30天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-table v-loading="growthLoading" :data="userGrowth" stripe>
        <el-table-column prop="date" label="日期" width="160" />
        <el-table-column prop="count" label="新增用户数" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getMiniProgramStats, getOverviewStats, getUserGrowth } from '../../api/stats'

const overview = reactive({
  total_mini_programs: 0,
  total_users: 0,
  total_members: 0,
  today_new_users: 0
})

const miniProgramStats = ref([])
const userGrowth = ref([])
const growthDays = ref(7)

const tableLoading = ref(false)
const growthLoading = ref(false)

const loadOverview = async () => {
  const res = await getOverviewStats()
  Object.assign(overview, res.data || {})
}

const loadMiniProgramStats = async () => {
  tableLoading.value = true
  try {
    const res = await getMiniProgramStats()
    miniProgramStats.value = res.data || []
  } finally {
    tableLoading.value = false
  }
}

const loadGrowth = async () => {
  growthLoading.value = true
  try {
    const res = await getUserGrowth(growthDays.value)
    userGrowth.value = res.data || []
  } finally {
    growthLoading.value = false
  }
}

const loadAll = async () => {
  await Promise.all([loadOverview(), loadMiniProgramStats(), loadGrowth()])
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cards {
  margin-bottom: 0;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.card-label {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.section-card {
  width: 100%;
}

.growth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
