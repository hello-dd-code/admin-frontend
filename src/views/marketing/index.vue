<template>
  <div class="marketing-page">
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      closable
      @close="errorMessage = ''"
    />

    <el-row :gutter="16" class="cards" v-loading="statsLoading">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ stats.categoryCount }}</div>
          <div class="card-label">分类总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ stats.templateCount }}</div>
          <div class="card-label">模板总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ stats.totalDownloads }}</div>
          <div class="card-label">总下载次数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-value">{{ stats.todayDownloads }}</div>
          <div class="card-label">今日下载</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="section-card">
      <template #header>
        <div class="header-row">
          <span>分类管理</span>
          <el-button type="primary" @click="openCategoryDialog()">新增分类</el-button>
        </div>
      </template>

      <el-table v-loading="categoriesLoading" :data="categories" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图标" width="80">
          <template #default="{ row }">
            <el-image v-if="row.icon" :src="row.icon" fit="contain" style="width: 32px; height: 32px" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="sort_order" label="排序" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openCategoryDialog(row)">编辑</el-button>
            <el-popconfirm title="确认删除该分类？" @confirm="handleDeleteCategory(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="section-card">
      <template #header>
        <div class="header-row">
          <div class="left-tools">
            <span>模板管理</span>
            <el-select
              v-model="templateQuery.category_id"
              clearable
              placeholder="按分类筛选"
              style="width: 180px"
              @change="handleTemplateFilterChange"
            >
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
          <el-button type="primary" @click="openTemplateDialog()">新增模板</el-button>
        </div>
      </template>

      <el-table v-loading="templatesLoading" :data="templateList" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="预览" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.thumbnail_url || row.image_url"
              :src="row.thumbnail_url || row.image_url"
              fit="cover"
              style="width: 56px; height: 56px; border-radius: 4px"
              :preview-src-list="[row.image_url]"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="模板名称" min-width="180" />
        <el-table-column label="分类" min-width="130">
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="尺寸" width="120">
          <template #default="{ row }">
            {{ row.width || 0 }} x {{ row.height || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="90" />
        <el-table-column prop="download_count" label="下载次数" width="100" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openTemplateDialog(row)">编辑</el-button>
            <el-popconfirm title="确认删除该模板？" @confirm="handleDeleteTemplate(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="templateQuery.page"
          v-model:page-size="templateQuery.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          :total="templateTotal"
          @current-change="loadTemplates"
          @size-change="handleTemplatePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryForm.id ? '编辑分类' : '新增分类'"
      width="520px"
    >
      <el-form label-width="90px">
        <el-form-item label="名称" required>
          <el-input v-model="categoryForm.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="categoryForm.icon" placeholder="可选：填写图标链接" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort_order" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="categoryForm.statusBool" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySaving" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="templateDialogVisible"
      :title="templateForm.id ? '编辑模板' : '新增模板'"
      width="620px"
    >
      <el-form label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateForm.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="所属分类" required>
          <el-select v-model="templateForm.category_id" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片URL" required>
          <el-input v-model="templateForm.image_url" placeholder="模板原图 URL" />
        </el-form-item>
        <el-form-item label="缩略图URL">
          <el-input v-model="templateForm.thumbnail_url" placeholder="可选：缩略图 URL" />
        </el-form-item>
        <el-form-item label="宽度(px)">
          <el-input-number v-model="templateForm.width" :min="0" :max="10000" />
        </el-form-item>
        <el-form-item label="高度(px)">
          <el-input-number v-model="templateForm.height" :min="0" :max="10000" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="templateForm.sort_order" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="templateForm.statusBool" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="templateSaving" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createMarketingCategory,
  createMarketingTemplate,
  deleteMarketingCategory,
  deleteMarketingTemplate,
  getMarketingCategories,
  getMarketingStats,
  getMarketingTemplates,
  updateMarketingCategory,
  updateMarketingTemplate
} from '../../api/marketing'

const errorMessage = ref('')

const statsLoading = ref(false)
const categoriesLoading = ref(false)
const templatesLoading = ref(false)

const stats = reactive({
  categoryCount: 0,
  templateCount: 0,
  totalDownloads: 0,
  todayDownloads: 0
})

const categories = ref([])

const templateQuery = reactive({
  category_id: undefined,
  page: 1,
  page_size: 20
})
const templateList = ref([])
const templateTotal = ref(0)

const categoryDialogVisible = ref(false)
const categorySaving = ref(false)
const categoryForm = reactive({
  id: null,
  name: '',
  icon: '',
  sort_order: 0,
  statusBool: true
})

const templateDialogVisible = ref(false)
const templateSaving = ref(false)
const templateForm = reactive({
  id: null,
  title: '',
  category_id: null,
  image_url: '',
  thumbnail_url: '',
  width: 0,
  height: 0,
  sort_order: 0,
  statusBool: true
})

const parseDownloads = (data, key) => {
  const candidates = [
    data?.[key],
    data?.[key.charAt(0).toUpperCase() + key.slice(1)],
    data?.[key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)]
  ]
  const value = candidates.find((item) => typeof item === 'number')
  return value || 0
}

const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const res = await getMarketingCategories()
    categories.value = res.data || []
    stats.categoryCount = categories.value.length
  } catch (error) {
    errorMessage.value = '加载分类失败，请稍后重试'
  } finally {
    categoriesLoading.value = false
  }
}

const loadTemplates = async () => {
  templatesLoading.value = true
  try {
    const params = {
      page: templateQuery.page,
      page_size: templateQuery.page_size
    }
    if (templateQuery.category_id) {
      params.category_id = templateQuery.category_id
    }

    const res = await getMarketingTemplates(params)
    const payload = res.data || {}
    templateList.value = payload.templates || []
    templateTotal.value = payload.total || 0
  } catch (error) {
    errorMessage.value = '加载模板失败，请稍后重试'
  } finally {
    templatesLoading.value = false
  }
}

const loadTemplateCount = async () => {
  try {
    const res = await getMarketingTemplates({ page: 1, page_size: 1 })
    const payload = res.data || {}
    stats.templateCount = payload.total || 0
  } catch (error) {
    stats.templateCount = 0
  }
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    const res = await getMarketingStats()
    const payload = res.data || {}
    stats.totalDownloads = parseDownloads(payload, 'totalDownloads')
    stats.todayDownloads = parseDownloads(payload, 'todayDownloads')
  } catch (error) {
    errorMessage.value = '加载营销统计失败，请稍后重试'
  } finally {
    statsLoading.value = false
  }
}

const loadAll = async () => {
  errorMessage.value = ''
  await Promise.all([loadCategories(), loadTemplates(), loadTemplateCount(), loadStats()])
}

const resetCategoryForm = () => {
  categoryForm.id = null
  categoryForm.name = ''
  categoryForm.icon = ''
  categoryForm.sort_order = 0
  categoryForm.statusBool = true
}

const openCategoryDialog = (row) => {
  if (!row) {
    resetCategoryForm()
  } else {
    categoryForm.id = row.id
    categoryForm.name = row.name || ''
    categoryForm.icon = row.icon || ''
    categoryForm.sort_order = row.sort_order || 0
    categoryForm.statusBool = row.status === 1
  }
  categoryDialogVisible.value = true
}

const saveCategory = async () => {
  const name = (categoryForm.name || '').trim()
  if (!name) {
    ElMessage.warning('请先填写分类名称')
    return
  }

  categorySaving.value = true
  try {
    const payload = {
      name,
      icon: (categoryForm.icon || '').trim(),
      sort_order: Number(categoryForm.sort_order || 0),
      status: categoryForm.statusBool ? 1 : 0
    }
    if (categoryForm.id) {
      await updateMarketingCategory(categoryForm.id, payload)
      ElMessage.success('分类更新成功')
    } else {
      await createMarketingCategory(payload)
      ElMessage.success('分类创建成功')
    }
    categoryDialogVisible.value = false
    await Promise.all([loadCategories(), loadTemplateCount()])
  } finally {
    categorySaving.value = false
  }
}

const handleDeleteCategory = async (id) => {
  await deleteMarketingCategory(id)
  ElMessage.success('分类删除成功')
  await Promise.all([loadCategories(), loadTemplates(), loadTemplateCount()])
}

const resetTemplateForm = () => {
  templateForm.id = null
  templateForm.title = ''
  templateForm.category_id = null
  templateForm.image_url = ''
  templateForm.thumbnail_url = ''
  templateForm.width = 0
  templateForm.height = 0
  templateForm.sort_order = 0
  templateForm.statusBool = true
}

const openTemplateDialog = (row) => {
  if (!row) {
    resetTemplateForm()
  } else {
    templateForm.id = row.id
    templateForm.title = row.title || ''
    templateForm.category_id = row.category_id || null
    templateForm.image_url = row.image_url || ''
    templateForm.thumbnail_url = row.thumbnail_url || ''
    templateForm.width = row.width || 0
    templateForm.height = row.height || 0
    templateForm.sort_order = row.sort_order || 0
    templateForm.statusBool = row.status === 1
  }
  templateDialogVisible.value = true
}

const saveTemplate = async () => {
  if (!(templateForm.title || '').trim()) {
    ElMessage.warning('请先填写模板名称')
    return
  }
  if (!templateForm.category_id) {
    ElMessage.warning('请选择所属分类')
    return
  }
  if (!(templateForm.image_url || '').trim()) {
    ElMessage.warning('请先填写图片URL')
    return
  }

  templateSaving.value = true
  try {
    const payload = {
      title: (templateForm.title || '').trim(),
      category_id: Number(templateForm.category_id),
      image_url: (templateForm.image_url || '').trim(),
      thumbnail_url: (templateForm.thumbnail_url || '').trim(),
      width: Number(templateForm.width || 0),
      height: Number(templateForm.height || 0),
      sort_order: Number(templateForm.sort_order || 0),
      status: templateForm.statusBool ? 1 : 0
    }

    if (templateForm.id) {
      await updateMarketingTemplate(templateForm.id, payload)
      ElMessage.success('模板更新成功')
    } else {
      await createMarketingTemplate(payload)
      ElMessage.success('模板创建成功')
    }

    templateDialogVisible.value = false
    await Promise.all([loadTemplates(), loadTemplateCount()])
  } finally {
    templateSaving.value = false
  }
}

const handleDeleteTemplate = async (id) => {
  await deleteMarketingTemplate(id)
  ElMessage.success('模板删除成功')
  await Promise.all([loadTemplates(), loadTemplateCount()])
}

const handleTemplateFilterChange = () => {
  templateQuery.page = 1
  loadTemplates()
}

const handleTemplatePageSizeChange = () => {
  templateQuery.page = 1
  loadTemplates()
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.marketing-page {
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.left-tools {
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
