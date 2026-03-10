<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <div class="filters">
          <el-input
            v-model="query.keyword"
            placeholder="搜索原文/解析链接/错误信息"
            clearable
            style="width: 260px"
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
          <el-input-number
            v-model="query.user_id"
            :min="1"
            :controls="false"
            placeholder="用户ID"
            style="width: 130px"
          />
          <el-select
            v-model="query.free_quota_used"
            clearable
            style="width: 150px"
            placeholder="免费次数"
            @change="handleSearch"
          >
            <el-option label="计入免费" :value="true" />
            <el-option label="不计入免费" :value="false" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="小程序" min-width="150">
        <template #default="{ row }">
          {{ row.mini_program_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="mini_program_id" label="小程序ID" width="110" />
      <el-table-column prop="user_id" label="用户ID" width="100" />
      <el-table-column label="原始内容" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.request_content || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="解析链接" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link
            v-if="row.parsed_url"
            :href="row.parsed_url"
            target="_blank"
            type="primary"
            :underline="false"
          >
            {{ row.parsed_url }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="第三方状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.third_party_status)">
            {{ displayStatus(row.third_party_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="第三方响应" min-width="180">
        <template #default="{ row }">
          <el-popover
            v-if="hasPayload(row.third_party_payload)"
            placement="top-start"
            :width="520"
            trigger="click"
          >
            <template #reference>
              <el-button type="primary" link>查看响应</el-button>
            </template>
            <pre class="payload-block">{{ formatPayload(row.third_party_payload) }}</pre>
          </el-popover>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="免费次数" width="100">
        <template #default="{ row }">
          <el-tag :type="row.free_quota_used ? 'success' : 'info'">
            {{ row.free_quota_used ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration_ms" label="耗时(ms)" width="110" />
      <el-table-column label="错误信息" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.error_message || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
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
</template>

<script setup>
import dayjs from 'dayjs'
import { onMounted, reactive, ref } from 'vue'
import { getMiniPrograms } from '../../api/miniProgram'
import { getVideoParseLogs } from '../../api/watermark'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const miniProgramOptions = ref([])
const dateRange = ref([])

const query = reactive({
  page: 1,
  page_size: 20,
  keyword: '',
  mini_program_id: undefined,
  user_id: undefined,
  free_quota_used: undefined
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const hasPayload = (value) => {
  if (value === null || value === undefined) return false
  return String(value).trim() !== ''
}

// 后端返回的 payload 可能是 JSON 字符串，也可能是对象，这里统一格式化展示
const formatPayload = (value) => {
  if (!hasPayload(value)) return '-'
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  const text = String(value)
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch (error) {
    return text
  }
}

const displayStatus = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const statusTagType = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return 'info'
  if (num >= 200 && num < 400) return 'success'
  if (num >= 400) return 'danger'
  return 'info'
}

const loadMiniProgramOptions = async () => {
  const res = await getMiniPrograms({ page: 1, page_size: 200 })
  const payload = res.data || {}
  miniProgramOptions.value = payload.list || []
}

const buildParams = () => {
  const params = {
    page: query.page,
    page_size: query.page_size,
    keyword: query.keyword || undefined,
    mini_program_id: query.mini_program_id,
    user_id: query.user_id,
    free_quota_used: query.free_quota_used
  }

  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    params.date_from = dateRange.value[0]
    params.date_to = dateRange.value[1]
  }

  return params
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getVideoParseLogs(buildParams())
    const payload = res.data || {}
    list.value = payload.list || []
    total.value = payload.total || 0
    query.page = payload.page || query.page
    query.page_size = payload.page_size || query.page_size
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.page = 1
  loadData()
}

const resetSearch = () => {
  query.keyword = ''
  query.mini_program_id = undefined
  query.user_id = undefined
  query.free_quota_used = undefined
  dateRange.value = []
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

onMounted(async () => {
  await Promise.all([loadMiniProgramOptions(), loadData()])
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.payload-block {
  max-height: 360px;
  overflow: auto;
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  background: #0f172a;
  color: #dbeafe;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
