<template>
  <el-card>
    <template #header>
      <span>编辑小程序</span>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="130px" style="max-width: 680px">
      <el-form-item label="小程序名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入小程序名称" />
      </el-form-item>
      <el-form-item label="AppID" prop="app_id">
        <el-input v-model="form.app_id" placeholder="请输入小程序 AppID" />
      </el-form-item>
      <el-form-item label="新 AppSecret">
        <el-input
          v-model="form.app_secret"
          type="password"
          show-password
          placeholder="留空则不修改"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选描述" />
      </el-form-item>

      <el-form-item>
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getMiniProgramById, updateMiniProgram } from '../../api/miniProgram'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const loading = ref(false)

const miniProgramId = route.params.id

const form = reactive({
  name: '',
  app_id: '',
  app_secret: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入小程序名称', trigger: 'blur' }],
  app_id: [{ required: true, message: '请输入 AppID', trigger: 'blur' }]
}

const goBack = () => {
  router.push('/mini-programs')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMiniProgramById(miniProgramId)
    const data = res.data || {}
    form.name = data.name || ''
    form.app_id = data.app_id || ''
    form.description = data.description || ''
  } finally {
    loading.value = false
  }
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
    await updateMiniProgram(miniProgramId, {
      name: form.name,
      app_id: form.app_id,
      app_secret: form.app_secret || undefined,
      description: form.description
    })
    ElMessage.success('更新成功')
    goBack()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
