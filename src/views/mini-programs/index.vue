<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <div class="left">
          <el-input
            v-model="query.keyword"
            placeholder="按小程序名称/AppID搜索"
            clearable
            style="width: 260px"
            @keyup.enter="loadData"
            @clear="loadData"
          />
          <el-button type="primary" @click="loadData">搜索</el-button>
        </div>
        <el-button type="primary" @click="goCreate">添加小程序</el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="小程序名称" min-width="180" />
      <el-table-column prop="app_id" label="AppID" min-width="220" />
      <el-table-column label="AppSecret" min-width="180">
        <template #default="{ row }">
          {{ maskSecret(row.app_secret) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="180" />
      <el-table-column prop="user_count" label="用户数" width="90" />
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goEdit(row.id)">编辑</el-button>
          <el-button link type="primary" @click="showStats(row)">统计</el-button>
          <el-popconfirm title="确认删除该小程序？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
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
        @size-change="handlePageSizeChange"
      />
    </div>
  </el-card>
</template>

<script setup>
import dayjs from 'dayjs'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { deleteMiniProgram, getMiniProgramStatsById, getMiniPrograms } from '../../api/miniProgram'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  page_size: 20,
  keyword: ''
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const maskSecret = (value) => {
  if (!value) return '****'
  if (value.length <= 8) return '****'
  return `${value.slice(0, 4)}****${value.slice(-4)}`
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMiniPrograms(query)
    const payload = res.data || {}
    list.value = payload.list || []
    total.value = payload.total || 0
    query.page = payload.page || query.page
    query.page_size = payload.page_size || query.page_size
  } finally {
    loading.value = false
  }
}

const handlePageSizeChange = () => {
  query.page = 1
  loadData()
}

const goCreate = () => {
  router.push('/mini-programs/create')
}

const goEdit = (id) => {
  router.push(`/mini-programs/${id}/edit`)
}

const handleDelete = async (id) => {
  await deleteMiniProgram(id)
  ElMessage.success('删除成功')
  loadData()
}

const showStats = async (row) => {
  const res = await getMiniProgramStatsById(row.id)
  const stats = res.data || {}
  await ElMessageBox.alert(
    `用户数：${stats.user_count || 0}\n数据量：${stats.data_count || 0}`,
    `${row.name} - 统计`,
    { confirmButtonText: '确定' }
  )
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
  gap: 12px;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
