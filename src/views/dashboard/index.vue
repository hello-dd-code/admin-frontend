<template>
  <div class="dashboard-page">
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      closable
      @close="errorMessage = ''"
    />

    <el-row v-loading="overviewLoading" :gutter="16" class="cards">
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
      <div v-loading="growthLoading" class="chart-wrap">
        <div ref="growthChartRef" class="growth-chart"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, reactive, ref, nextTick } from 'vue'
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
const errorMessage = ref('')

const overviewLoading = ref(false)
const tableLoading = ref(false)
const growthLoading = ref(false)
const growthChartRef = ref(null)
let growthChart = null
let refreshTimer = null

const loadOverview = async () => {
  overviewLoading.value = true
  try {
    const res = await getOverviewStats()
    Object.assign(overview, res.data || {})
  } catch (error) {
    errorMessage.value = '加载总览数据失败，请稍后重试'
  } finally {
    overviewLoading.value = false
  }
}

const loadMiniProgramStats = async () => {
  tableLoading.value = true
  try {
    const res = await getMiniProgramStats()
    miniProgramStats.value = res.data || []
  } catch (error) {
    errorMessage.value = '加载小程序统计失败，请稍后重试'
  } finally {
    tableLoading.value = false
  }
}

const renderGrowthChart = async () => {
  await nextTick()
  if (!growthChartRef.value) return

  if (!growthChart) {
    growthChart = echarts.init(growthChartRef.value)
  }

  const labels = userGrowth.value.map((item) => item.date)
  const values = userGrowth.value.map((item) => item.count || 0)

  growthChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: labels
    },
    yAxis: {
      type: 'value'
    },
    grid: {
      left: 24,
      right: 24,
      top: 30,
      bottom: 24,
      containLabel: true
    },
    series: [
      {
        name: '新增用户数',
        type: 'line',
        smooth: true,
        data: values,
        areaStyle: {
          opacity: 0.12
        }
      }
    ]
  })
}

const loadGrowth = async () => {
  growthLoading.value = true
  try {
    const res = await getUserGrowth(growthDays.value)
    userGrowth.value = res.data || []
    await renderGrowthChart()
  } catch (error) {
    errorMessage.value = '加载用户增长趋势失败，请稍后重试'
  } finally {
    growthLoading.value = false
  }
}

const loadAll = async () => {
  errorMessage.value = ''
  await Promise.all([loadOverview(), loadMiniProgramStats(), loadGrowth()])
}

const handleResize = () => {
  if (growthChart) {
    growthChart.resize()
  }
}

onMounted(() => {
  loadAll()
  refreshTimer = window.setInterval(loadAll, 5 * 60 * 1000)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  window.removeEventListener('resize', handleResize)
  if (growthChart) {
    growthChart.dispose()
    growthChart = null
  }
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

.chart-wrap {
  width: 100%;
  min-height: 320px;
}

.growth-chart {
  width: 100%;
  min-height: 320px;
}
</style>
