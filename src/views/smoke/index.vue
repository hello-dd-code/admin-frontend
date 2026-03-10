<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <span>戒烟小程序数据管理（fa_smoke）</span>
      </div>
    </template>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="抽烟记录" name="logs" />
      <el-tab-pane label="用户画像" name="profiles" />
      <el-tab-pane label="AI建议" name="aiAdvices" />
      <el-tab-pane label="AI解锁" name="aiUnlocks" />
      <el-tab-pane label="AI节点" name="aiNexts" />
      <el-tab-pane label="激励语模板" name="motivations" />
    </el-tabs>

    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="可选：按 uid 过滤（仅数字）"
        style="width: 260px"
        clearable
        @keyup.enter="loadActiveData"
        @clear="loadActiveData"
      />
      <el-button type="primary" @click="loadActiveData">刷新</el-button>
      <el-button type="success" @click="openCreate">新增</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="UID" width="100">
        <template #default="{ row }">
          {{ row.uid ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="数据预览" min-width="360">
        <template #default="{ row }">
          <pre class="json-preview">{{ formatRow(row) }}</pre>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @current-change="loadActiveData"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="780px">
      <div class="dialog-tip">请填写 JSON（字段需符合当前 Tab 对应接口要求）</div>
      <el-input
        v-model="jsonForm"
        type="textarea"
        :rows="16"
        placeholder='例如：{"uid": 1, "remark": "测试"}'
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import {
  listSmokeLogs,
  createSmokeLog,
  updateSmokeLog,
  deleteSmokeLog,
  listSmokeProfiles,
  createSmokeProfile,
  updateSmokeProfile,
  deleteSmokeProfile,
  listSmokeAIAdvices,
  createSmokeAIAdvice,
  updateSmokeAIAdvice,
  deleteSmokeAIAdvice,
  listSmokeAIUnlocks,
  createSmokeAIUnlock,
  updateSmokeAIUnlock,
  deleteSmokeAIUnlock,
  listSmokeAINexts,
  createSmokeAINext,
  updateSmokeAINext,
  deleteSmokeAINext,
  listSmokeMotivations,
  createSmokeMotivation,
  updateSmokeMotivation,
  deleteSmokeMotivation
} from '../../api/smoke'

// 每个 Tab 绑定对应的 CRUD API，便于统一维护。
const tabMap = {
  logs: { list: listSmokeLogs, create: createSmokeLog, update: updateSmokeLog, remove: deleteSmokeLog },
  profiles: { list: listSmokeProfiles, create: createSmokeProfile, update: updateSmokeProfile, remove: deleteSmokeProfile },
  aiAdvices: { list: listSmokeAIAdvices, create: createSmokeAIAdvice, update: updateSmokeAIAdvice, remove: deleteSmokeAIAdvice },
  aiUnlocks: { list: listSmokeAIUnlocks, create: createSmokeAIUnlock, update: updateSmokeAIUnlock, remove: deleteSmokeAIUnlock },
  aiNexts: { list: listSmokeAINexts, create: createSmokeAINext, update: updateSmokeAINext, remove: deleteSmokeAINext },
  motivations: { list: listSmokeMotivations, create: createSmokeMotivation, update: updateSmokeMotivation, remove: deleteSmokeMotivation }
}

const activeTab = ref('logs')
const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingId = ref(null)
const jsonForm = ref(`{\n  "uid": 1\n}`)

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增记录' : `编辑记录 #${editingId.value}`))

const formatRow = (row) => JSON.stringify(row, null, 2)

const buildParams = () => {
  const params = {
    page: page.value,
    page_size: pageSize.value
  }

  const uid = Number(keyword.value)
  if (keyword.value && !Number.isNaN(uid) && uid > 0) {
    params.uid = uid
  }

  return params
}

const getApi = () => tabMap[activeTab.value]

const loadActiveData = async () => {
  loading.value = true
  try {
    const res = await getApi().list(buildParams())
    const payload = res.data || {}
    rows.value = payload.list || []
    total.value = payload.total || 0
    page.value = payload.page || page.value
    pageSize.value = payload.page_size || pageSize.value
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  page.value = 1
  loadActiveData()
}

const handleSizeChange = () => {
  page.value = 1
  loadActiveData()
}

const openCreate = () => {
  dialogMode.value = 'create'
  editingId.value = null
  jsonForm.value = '{\n  "uid": 1\n}'
  dialogVisible.value = true
}

const openEdit = (row) => {
  dialogMode.value = 'edit'
  editingId.value = row.id
  jsonForm.value = JSON.stringify(row, null, 2)
  dialogVisible.value = true
}

const parseJsonForm = () => {
  try {
    return JSON.parse(jsonForm.value)
  } catch (error) {
    throw new Error('JSON 格式错误，请检查后重试')
  }
}

const handleSubmit = async () => {
  let payload
  try {
    payload = parseJsonForm()
  } catch (error) {
    ElMessage.error(error.message)
    return
  }

  saving.value = true
  try {
    if (dialogMode.value === 'create') {
      await getApi().create(payload)
      ElMessage.success('新增成功')
    } else {
      await getApi().update(editingId.value, payload)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    await loadActiveData()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('删除后不可恢复，确定继续吗？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await getApi().remove(row.id)
  ElMessage.success('删除成功')
  await loadActiveData()
}

loadActiveData()
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.json-preview {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 180px;
  overflow: auto;
  background: #f8fafc;
  padding: 8px;
  border-radius: 4px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-tip {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}
</style>
