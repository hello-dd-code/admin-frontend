<template>
  <div class="memberships-page">
    <el-row :gutter="16" class="cards">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.total_members || 0 }}</div>
          <div class="card-label">会员总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.active_members || 0 }}</div>
          <div class="card-label">有效会员</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.expiring_soon || 0 }}</div>
          <div class="card-label">7天内到期</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ overview.today_redeemed || 0 }}</div>
          <div class="card-label">今日兑换</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="header-row">
          <div class="filters">
            <el-input
              v-model="query.keyword"
              placeholder="搜索兑换码"
              clearable
              style="width: 200px"
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
              v-model="query.status"
              placeholder="全部状态"
              clearable
              style="width: 140px"
              @change="handleSearch"
            >
              <el-option label="可用" value="active" />
              <el-option label="已停用" value="disabled" />
              <el-option label="已过期" value="expired" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
          <div class="right-actions">
            <el-button
              :disabled="selectedActiveCount === 0"
              :loading="batchDisabling"
              type="warning"
              @click="handleBatchDisable"
            >
              批量停用{{ selectedActiveCount > 0 ? `(${selectedActiveCount})` : '' }}
            </el-button>
            <el-button type="primary" @click="openCreateDialog">生成兑换码</el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="list"
        row-key="id"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" reserve-selection />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="兑换码" min-width="180" />
        <el-table-column label="小程序" min-width="140">
          <template #default="{ row }">
            {{ row.mini_program_name || row.mini_program?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="套餐类型" width="120">
          <template #default="{ row }">
            {{ row.package_type || row.plan_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="时长(天)" width="100">
          <template #default="{ row }">
            {{ row.duration_days || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="使用次数" width="100">
          <template #default="{ row }">
            {{ row.used_count || 0 }}/{{ row.max_uses || 1 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.expires_at) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetailDialog(row)">详情</el-button>
            <el-button link @click="handleCopyCode(row)">复制</el-button>
            <el-button
              v-if="row.status === 'active'"
              link
              type="danger"
              @click="handleDisable(row)"
            >
              停用
            </el-button>
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

    <el-dialog v-model="createDialogVisible" title="生成兑换码" width="520px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="110px">
        <el-form-item label="所属小程序" prop="mini_program_id">
          <el-select v-model="createForm.mini_program_id" placeholder="请选择小程序" style="width: 100%">
            <el-option
              v-for="item in miniProgramOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="套餐类型" prop="package_type">
          <el-select v-model="createForm.package_type" style="width: 100%">
            <el-option label="月卡" value="month" />
            <el-option label="季卡" value="quarter" />
            <el-option label="年卡" value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="时长(天)" prop="duration_days">
          <el-input-number v-model="createForm.duration_days" :min="1" :max="3650" />
        </el-form-item>
        <el-form-item label="生成数量" prop="quantity">
          <el-input-number v-model="createForm.quantity" :min="1" :max="200" />
        </el-form-item>
        <el-form-item label="每码可用次数" prop="max_uses">
          <el-input-number v-model="createForm.max_uses" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="createForm.expires_at"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="可选，不填则长期有效"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">生成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="兑换码详情" width="560px">
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="ID">{{ detailRecord.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="兑换码">{{ detailRecord.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(detailRecord.status) }}</el-descriptions-item>
        <el-descriptions-item label="所属小程序">
          {{ detailRecord.mini_program_name || detailRecord.mini_program?.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="套餐类型">
          {{ detailRecord.package_type || detailRecord.plan_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="时长(天)">{{ detailRecord.duration_days || '-' }}</el-descriptions-item>
        <el-descriptions-item label="可用次数">
          {{ detailRecord.max_uses || 1 }}
        </el-descriptions-item>
        <el-descriptions-item label="已使用次数">
          {{ detailRecord.used_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="过期时间">
          {{ formatDateTime(detailRecord.expires_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(detailRecord.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { getMiniPrograms } from '../../api/miniProgram'
import {
  createMembershipRedeemCodes,
  getMembershipOverview,
  getMembershipRedeemCodes,
  updateMembershipRedeemCodeStatus
} from '../../api/membership'

const loading = ref(false)
const creating = ref(false)
const list = ref([])
const total = ref(0)
const miniProgramOptions = ref([])
const tableRef = ref(null)
const selectedRows = ref([])
const batchDisabling = ref(false)
const createDialogVisible = ref(false)
const createFormRef = ref(null)
const detailDialogVisible = ref(false)
const detailRecord = ref(null)

const overview = reactive({
  total_members: 0,
  active_members: 0,
  expiring_soon: 0,
  today_redeemed: 0
})

const query = reactive({
  page: 1,
  page_size: 20,
  mini_program_id: undefined,
  status: undefined,
  keyword: ''
})

const createForm = reactive({
  mini_program_id: undefined,
  package_type: 'month',
  duration_days: 30,
  quantity: 10,
  max_uses: 1,
  expires_at: ''
})

const createRules = {
  mini_program_id: [{ required: true, message: '请选择小程序', trigger: 'change' }],
  package_type: [{ required: true, message: '请选择套餐类型', trigger: 'change' }],
  duration_days: [{ required: true, message: '请输入时长', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入生成数量', trigger: 'blur' }],
  max_uses: [{ required: true, message: '请输入可用次数', trigger: 'blur' }]
}

const selectedActiveRows = computed(() => selectedRows.value.filter((item) => item.status === 'active'))
const selectedActiveCount = computed(() => selectedActiveRows.value.length)

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const statusText = (status) => {
  if (status === 'active') return '可用'
  if (status === 'disabled') return '已停用'
  if (status === 'expired') return '已过期'
  return status || '-'
}

const statusTagType = (status) => {
  if (status === 'active') return 'success'
  if (status === 'disabled') return 'info'
  if (status === 'expired') return 'danger'
  return 'info'
}

const loadMiniPrograms = async () => {
  const res = await getMiniPrograms({ page: 1, page_size: 200 })
  const payload = res.data || {}
  miniProgramOptions.value = payload.list || []
}

const loadOverview = async () => {
  const res = await getMembershipOverview()
  const payload = res.data || {}
  overview.total_members = payload.total_members || 0
  overview.active_members = payload.active_members || 0
  overview.expiring_soon = payload.expiring_soon || 0
  overview.today_redeemed = payload.today_redeemed || 0
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMembershipRedeemCodes(query)
    const payload = res.data || {}
    list.value = payload.list || payload.items || []
    selectedRows.value = []
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
  query.status = undefined
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows || []
}

const openCreateDialog = () => {
  createDialogVisible.value = true
}

const openDetailDialog = (row) => {
  detailRecord.value = row
  detailDialogVisible.value = true
}

const handleCopyCode = async (row) => {
  if (!row?.code) {
    ElMessage.warning('兑换码为空，无法复制')
    return
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(row.code)
    } else {
      const input = document.createElement('input')
      input.value = row.code
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    ElMessage.success('兑换码已复制')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  try {
    await createFormRef.value.validate()
  } catch (error) {
    return
  }

  creating.value = true
  try {
    const res = await createMembershipRedeemCodes(createForm)
    const codes = res?.data?.codes || []
    ElMessage.success(`生成成功，共 ${createForm.quantity} 个`)
    if (codes.length > 0) {
      await ElMessageBox.alert(codes.join('\n'), '新生成兑换码', {
        confirmButtonText: '确定'
      })
    }
    createDialogVisible.value = false
    loadData()
  } finally {
    creating.value = false
  }
}

const handleDisable = async (row) => {
  await ElMessageBox.confirm('停用后该兑换码将无法再使用，是否继续？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  await updateMembershipRedeemCodeStatus(row.id, { status: 'disabled' })
  ElMessage.success('已停用')
  loadData()
}

const handleBatchDisable = async () => {
  if (selectedActiveRows.value.length === 0) {
    ElMessage.warning('请先选择可用状态的兑换码')
    return
  }

  const activeCount = selectedActiveRows.value.length
  await ElMessageBox.confirm(`确认批量停用 ${activeCount} 条兑换码吗？`, '批量停用', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  batchDisabling.value = true
  try {
    const results = await Promise.allSettled(
      selectedActiveRows.value.map((item) =>
        updateMembershipRedeemCodeStatus(item.id, { status: 'disabled' })
      )
    )

    const successCount = results.filter((item) => item.status === 'fulfilled').length
    const failCount = activeCount - successCount

    if (successCount > 0) {
      ElMessage.success(`批量停用完成：成功 ${successCount} 条${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('批量停用失败，请稍后重试')
    }

    tableRef.value?.clearSelection()
    await loadData()
  } finally {
    batchDisabling.value = false
  }
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
  font-size: 28px;
  font-weight: 600;
  color: #303133;
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

.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
