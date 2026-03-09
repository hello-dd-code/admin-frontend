<template>
  <div class="expiry-page">
    <el-row :gutter="16" class="cards">
      <el-col :xs="12" :sm="12" :md="4">
        <el-card shadow="hover">
          <div class="card-value">{{ summary.total_items || 0 }}</div>
          <div class="card-label">物品总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="4">
        <el-card shadow="hover">
          <div class="card-value warning">{{ summary.expiring_soon || 0 }}</div>
          <div class="card-label">即将过期</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="4">
        <el-card shadow="hover">
          <div class="card-value danger">{{ summary.expired || 0 }}</div>
          <div class="card-label">已过期</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="4">
        <el-card shadow="hover">
          <div class="card-value success">{{ summary.normal || 0 }}</div>
          <div class="card-label">正常</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="4">
        <el-card shadow="hover">
          <div class="card-value">{{ summary.used || 0 }}</div>
          <div class="card-label">已使用</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="4">
        <el-card shadow="hover">
          <div class="card-value">{{ summary.discarded || 0 }}</div>
          <div class="card-label">已丢弃</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="header-row">
          <div class="filters">
            <el-input
              v-model="query.keyword"
              placeholder="搜索物品名称"
              clearable
              style="width: 220px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-select
              v-model="query.status"
              clearable
              style="width: 150px"
              placeholder="全部状态"
              @change="handleSearch"
            >
              <el-option label="正常" value="normal" />
              <el-option label="即将过期" value="expiring" />
              <el-option label="已过期" value="expired" />
              <el-option label="已使用" value="used" />
              <el-option label="已丢弃" value="discarded" />
            </el-select>
            <el-select
              v-model="query.category"
              clearable
              style="width: 150px"
              placeholder="全部分类"
              @change="handleSearch"
            >
              <el-option label="食品" value="food" />
              <el-option label="药品" value="medicine" />
              <el-option label="化妆品" value="cosmetic" />
              <el-option label="其他" value="other" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
          <el-button type="primary" @click="openCreateDialog">新增物品</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="物品名称" min-width="160" />
        <el-table-column label="分类" width="110">
          <template #default="{ row }">
            {{ categoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="过期日期" width="130">
          <template #default="{ row }">
            {{ formatDate(row.expiry_date) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余天数" width="100">
          <template #default="{ row }">
            <span :class="daysClass(row.days_left)">{{ row.days_left ?? '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" prop="quantity" />
        <el-table-column prop="location" label="位置" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              v-if="!['used', 'discarded'].includes(row.status)"
              link
              type="success"
              @click="handleMarkStatus(row, 'used')"
            >
              标记已使用
            </el-button>
            <el-button
              v-if="!['used', 'discarded'].includes(row.status)"
              link
              type="warning"
              @click="handleMarkStatus(row, 'discarded')"
            >
              标记丢弃
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑物品' : '新增物品'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="物品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option label="食品" value="food" />
            <el-option label="药品" value="medicine" />
            <el-option label="化妆品" value="cosmetic" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="过期日期" prop="expiry_date">
          <el-date-picker
            v-model="form.expiry_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="form.location" placeholder="可选" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import {
  createExpiryItem,
  deleteExpiryItem,
  getExpiryItems,
  getExpirySummary,
  updateExpiryItem,
  updateExpiryItemStatus
} from '../../api/expiry'

const loading = ref(false)
const submitting = ref(false)
const list = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const summary = reactive({
  total_items: 0,
  expiring_soon: 0,
  expired: 0,
  normal: 0,
  used: 0,
  discarded: 0
})

const query = reactive({
  page: 1,
  page_size: 20,
  keyword: '',
  status: undefined,
  category: undefined
})

const form = reactive({
  id: undefined,
  name: '',
  category: 'food',
  expiry_date: '',
  quantity: 1,
  location: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  expiry_date: [{ required: true, message: '请选择过期日期', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const formatDate = (value) => {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD')
}

const categoryText = (category) => {
  if (category === 'food') return '食品'
  if (category === 'medicine') return '药品'
  if (category === 'cosmetic') return '化妆品'
  if (category === 'other') return '其他'
  return category || '-'
}

const statusText = (status) => {
  if (status === 'normal') return '正常'
  if (status === 'expiring') return '即将过期'
  if (status === 'expired') return '已过期'
  if (status === 'used') return '已使用'
  if (status === 'discarded') return '已丢弃'
  return status || '-'
}

const statusTagType = (status) => {
  if (status === 'normal') return 'success'
  if (status === 'expiring') return 'warning'
  if (status === 'expired') return 'danger'
  if (status === 'used') return 'info'
  if (status === 'discarded') return ''
  return 'info'
}

const daysClass = (daysLeft) => {
  if (daysLeft == null) return ''
  if (daysLeft < 0) return 'danger'
  if (daysLeft <= 7) return 'warning'
  return 'success'
}

const loadSummary = async () => {
  const res = await getExpirySummary()
  const payload = res.data || {}
  summary.total_items = payload.total_items || 0
  summary.expiring_soon = payload.expiring_soon || 0
  summary.expired = payload.expired || 0
  summary.normal = payload.normal || 0
  summary.used = payload.used || 0
  summary.discarded = payload.discarded || 0
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExpiryItems(query)
    const payload = res.data || {}
    list.value = payload.list || payload.items || []
    total.value = payload.total || 0
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
  query.status = undefined
  query.category = undefined
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const openCreateDialog = () => {
  isEdit.value = false
  form.id = undefined
  form.name = ''
  form.category = 'food'
  form.expiry_date = ''
  form.quantity = 1
  form.location = ''
  form.remark = ''
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name || ''
  form.category = row.category || 'food'
  form.expiry_date = row.expiry_date ? dayjs(row.expiry_date).format('YYYY-MM-DD') : ''
  form.quantity = row.quantity || 1
  form.location = row.location || ''
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: form.name,
      category: form.category,
      expiry_date: form.expiry_date,
      quantity: form.quantity,
      location: form.location,
      remark: form.remark
    }

    if (isEdit.value && form.id) {
      await updateExpiryItem(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createExpiryItem(payload)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    await Promise.all([loadSummary(), loadData()])
  } finally {
    submitting.value = false
  }
}

const handleMarkStatus = async (row, status) => {
  const actionText = status === 'used' ? '标记为已使用' : '标记为已丢弃'
  await ElMessageBox.confirm(`确认${actionText}吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  await updateExpiryItemStatus(row.id, status)
  ElMessage.success('更新成功')
  await Promise.all([loadSummary(), loadData()])
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('删除后不可恢复，确认删除该物品？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await deleteExpiryItem(row.id)
  ElMessage.success('删除成功')
  await Promise.all([loadSummary(), loadData()])
}

onMounted(async () => {
  await Promise.all([loadSummary(), loadData()])
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

.card-value.warning {
  color: #e6a23c;
}

.card-value.danger {
  color: #f56c6c;
}

.card-value.success {
  color: #67c23a;
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

.danger {
  color: #f56c6c;
}

.warning {
  color: #e6a23c;
}

.success {
  color: #67c23a;
}
</style>
