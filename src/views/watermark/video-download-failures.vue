<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <div class="filters">
          <el-input
            v-model="query.keyword"
            placeholder="搜索失败链接/错误信息/UA"
            clearable
            style="width: 260px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-input
            v-model="query.domain"
            placeholder="来源域名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
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
      <el-table-column prop="domain" label="域名" min-width="140" />
      <el-table-column label="失败链接" min-width="280" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link :href="row.failed_url" target="_blank" type="primary" :underline="false">
            {{ row.failed_url }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.error_message || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="client_ip" label="IP" width="140" />
      <el-table-column label="UA" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.user_agent || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="上报时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.reported_at) }}
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
import { getVideoDownloadFailures } from '../../api/watermark'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const dateRange = ref([])

const query = reactive({
  page: 1,
  page_size: 20,
  keyword: '',
  domain: ''
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const buildParams = () => {
  const params = {
    page: query.page,
    page_size: query.page_size,
    keyword: query.keyword || undefined,
    domain: query.domain || undefined
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
    const res = await getVideoDownloadFailures(buildParams())
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
  query.domain = ''
  dateRange.value = []
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

onMounted(() => {
  loadData()
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
