<template>
  <div class="watermark-page">
    <el-row :gutter="16" class="cards">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.total_tasks || 0 }}</div>
          <div class="card-label">总任务数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value success">{{ overview.success_tasks || 0 }}</div>
          <div class="card-label">成功任务</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value warning">{{ overview.processing_tasks || 0 }}</div>
          <div class="card-label">处理中</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value danger">{{ overview.failed_tasks || 0 }}</div>
          <div class="card-label">失败任务</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="header-row">
          <div class="filters">
            <el-input
              v-model="query.keyword"
              clearable
              style="width: 220px"
              placeholder="搜索视频链接/用户ID"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-select
              v-model="query.mini_program_id"
              clearable
              style="width: 180px"
              placeholder="全部小程序"
              @change="handleSearch"
            >
              <el-option
                v-for="item in miniProgramOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-model="query.status"
              clearable
              style="width: 150px"
              placeholder="全部状态"
              @change="handleSearch"
            >
              <el-option label="成功" value="success" />
              <el-option label="处理中" value="processing" />
              <el-option label="失败" value="failed" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
          <el-button @click="refreshAll">刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="小程序" min-width="140">
          <template #default="{ row }">
            {{ row.mini_program_name || row.mini_program?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="平台" width="100">
          <template #default="{ row }">
            {{ row.platform || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="原始链接" min-width="220">
          <template #default="{ row }">
            <el-link :href="row.source_url" target="_blank" type="primary" :underline="false">
              {{ row.source_url || '-' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="解析结果" min-width="220">
          <template #default="{ row }">
            <el-link
              v-if="row.cleaned_url || row.result_url"
              :href="row.cleaned_url || row.result_url"
              target="_blank"
              type="success"
              :underline="false"
            >
              查看无水印链接
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="耗时(ms)" width="100">
          <template #default="{ row }">
            {{ row.duration_ms || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="失败原因" min-width="160">
          <template #default="{ row }">
            {{ row.error_message || row.fail_reason || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'failed'"
              link
              type="primary"
              @click="handleRetry(row)"
            >
              重试
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { getMiniPrograms } from '../../api/miniProgram'
import {
  deleteWatermarkTask,
  getWatermarkOverview,
  getWatermarkTasks,
  retryWatermarkTask
} from '../../api/watermark'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const miniProgramOptions = ref([])

const overview = reactive({
  total_tasks: 0,
  success_tasks: 0,
  processing_tasks: 0,
  failed_tasks: 0
})

const query = reactive({
  page: 1,
  page_size: 20,
  mini_program_id: undefined,
  status: undefined,
  keyword: ''
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const statusText = (status) => {
  if (status === 'success') return '成功'
  if (status === 'processing') return '处理中'
  if (status === 'failed') return '失败'
  return status || '-'
}

const statusTagType = (status) => {
  if (status === 'success') return 'success'
  if (status === 'processing') return 'warning'
  if (status === 'failed') return 'danger'
  return 'info'
}

const loadMiniPrograms = async () => {
  const res = await getMiniPrograms({ page: 1, page_size: 200 })
  const payload = res.data || {}
  miniProgramOptions.value = payload.list || []
}

const loadOverview = async () => {
  const res = await getWatermarkOverview()
  const payload = res.data || {}
  overview.total_tasks = payload.total_tasks || 0
  overview.success_tasks = payload.success_tasks || 0
  overview.processing_tasks = payload.processing_tasks || 0
  overview.failed_tasks = payload.failed_tasks || 0
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWatermarkTasks(query)
    const payload = res.data || {}
    list.value = payload.list || payload.items || []
    total.value = payload.total || 0
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([loadOverview(), loadData()])
}

const handleSearch = () => {
  query.page = 1
  loadData()
}

const resetSearch = () => {
  query.keyword = ''
  query.status = undefined
  query.mini_program_id = undefined
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const handleRetry = async (row) => {
  await retryWatermarkTask(row.id)
  ElMessage.success('已提交重试')
  refreshAll()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确认删除该任务记录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await deleteWatermarkTask(row.id)
  ElMessage.success('删除成功')
  refreshAll()
}

onMounted(async () => {
  await Promise.all([loadMiniPrograms(), loadOverview(), loadData()])
})
</script>

<style scoped>
.cards {
  margin-bottom: 16px;
}

.card-value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
}

.card-value.success {
  color: #67c23a;
}

.card-value.warning {
  color: #e6a23c;
}

.card-value.danger {
  color: #f56c6c;
}

.card-label {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
