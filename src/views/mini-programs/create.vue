<template>
  <el-card>
    <template #header>
      <span>添加小程序</span>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" style="max-width: 680px">
      <el-form-item label="小程序名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入小程序名称" />
      </el-form-item>
      <el-form-item label="AppID" prop="app_id">
        <el-input v-model="form.app_id" placeholder="请输入小程序 AppID" />
      </el-form-item>
      <el-form-item label="AppSecret" prop="app_secret">
        <el-input v-model="form.app_secret" type="password" show-password placeholder="请输入小程序 AppSecret" />
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
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { createMiniProgram } from '../../api/miniProgram'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  app_id: '',
  app_secret: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入小程序名称', trigger: 'blur' }],
  app_id: [{ required: true, message: '请输入 AppID', trigger: 'blur' }],
  app_secret: [{ required: true, message: '请输入 AppSecret', trigger: 'blur' }]
}

const goBack = () => {
  router.push('/mini-programs')
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
    await createMiniProgram(form)
    ElMessage.success('创建成功')
    goBack()
  } finally {
    submitting.value = false
  }
}
</script>
