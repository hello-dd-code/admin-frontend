<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <div class="filters">
          <el-input
            v-model="query.keyword"
            placeholder="搜索昵称/手机号"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-select
            v-model="query.mini_program_id"
            placeholder="全部小程序"
            clearable
            style="width: 180px"
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
            v-model="query.is_member"
            placeholder="全部会员状态"
            clearable
            style="width: 160px"
            @change="handleSearch"
          >
            <el-option label="会员" :value="1" />
            <el-option label="非会员" :value="0" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :size="36" :src="row.avatar || row.avatar_url">
            {{ (row.nickname || 'U').slice(0, 1) }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column label="手机号" min-width="140">
        <template #default="{ row }">
          {{ maskPhone(row.phone || row.mobile) }}
        </template>
      </el-table-column>
      <el-table-column label="所属小程序" min-width="140">
        <template #default="{ row }">
          {{ row.mini_program_name || row.mini_program?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="会员状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getMemberTagType(row.is_member)">
            {{ row.is_member ? '会员' : '非会员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at || row.registered_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row.id)">查看详情</el-button>
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
import { useRouter } from 'vue-router'
import { getMiniPrograms } from '../../api/miniProgram'
import { getUsers } from '../../api/user'

const router = useRouter()

const loading = ref(false)
const list = ref([])
const total = ref(0)
const miniProgramOptions = ref([])

const query = reactive({
  page: 1,
  page_size: 20,
  mini_program_id: undefined,
  keyword: '',
  is_member: undefined
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

const getMemberTagType = (isMember) => {
  return isMember ? 'success' : 'info'
}

const loadMiniProgramOptions = async () => {
  const res = await getMiniPrograms({
    page: 1,
    page_size: 200
  })
  const payload = res.data || {}
  miniProgramOptions.value = payload.list || []
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers(query)
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
  query.is_member = undefined
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const goDetail = (id) => {
  router.push(`/users/${id}`)
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
