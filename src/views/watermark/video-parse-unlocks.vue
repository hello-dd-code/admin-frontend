<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <div class="filters">
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
      <el-table-column label="小程序" min-width="160">
        <template #default="{ row }">
          {{ row.mini_program_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="user_id" label="用户ID" width="100" />
      <el-table-column label="解锁日期" width="140">
        <template #default="{ row }">
          {{ formatDate(row.unlock_date) }}
        </template>
      </el-table-column>
      <el-table-column label="广告完成时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.ad_watched_at) }}
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
import { getVideoParseUnlocks } from '../../api/watermark'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const miniProgramOptions = ref([])
const dateRange = ref([])

const query = reactive({
  page: 1,
  page_size: 20,
  mini_program_id: undefined,
  user_id: undefined
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const formatDate = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD')
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
    mini_program_id: query.mini_program_id,
    user_id: query.user_id
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
    const res = await getVideoParseUnlocks(buildParams())
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
  query.mini_program_id = undefined
  query.user_id = undefined
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
