<template>
  <el-card>
    <template #header>
      <span>系统设置</span>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人资料" name="profile">
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-width="120px"
          style="max-width: 680px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="profileForm.username" disabled />
          </el-form-item>
          <el-form-item label="显示名称" prop="display_name">
            <el-input v-model="profileForm.display_name" placeholder="请输入显示名称" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="时区">
            <el-select v-model="profileForm.timezone" style="width: 100%">
              <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
              <el-option label="UTC" value="UTC" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="profileSaving" @click="handleSaveProfile">保存资料</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="120px"
          style="max-width: 560px"
        >
          <el-form-item label="当前密码" prop="old_password">
            <el-input v-model="passwordForm.old_password" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="new_password">
            <el-input v-model="passwordForm.new_password" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirm_password">
            <el-input v-model="passwordForm.confirm_password" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="passwordSaving" @click="handleChangePassword">
              更新密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="系统参数" name="system">
        <el-form label-width="180px" style="max-width: 720px">
          <el-form-item label="后台名称">
            <el-input v-model="systemForm.site_name" placeholder="系统名称" />
          </el-form-item>
          <el-form-item label="允许注册">
            <el-switch v-model="systemForm.allow_register" />
          </el-form-item>
          <el-form-item label="登录失败锁定阈值">
            <el-input-number v-model="systemForm.login_fail_limit" :min="3" :max="20" />
          </el-form-item>
          <el-form-item label="默认分页大小">
            <el-input-number v-model="systemForm.default_page_size" :min="10" :max="200" />
          </el-form-item>
          <el-form-item label="操作日志保留天数">
            <el-input-number v-model="systemForm.audit_log_retention_days" :min="7" :max="3650" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="systemSaving" @click="handleSaveSystem">保存参数</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import {
  getAdminSettings,
  getSystemConfig,
  updateAdminPassword,
  updateAdminProfile,
  updateSystemConfig
} from '../../api/settings'

const activeTab = ref('profile')
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const profileSaving = ref(false)
const passwordSaving = ref(false)
const systemSaving = ref(false)

const profileForm = reactive({
  username: '',
  display_name: '',
  email: '',
  phone: '',
  timezone: 'Asia/Shanghai'
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const systemForm = reactive({
  site_name: '多小程序管理后台',
  allow_register: false,
  login_fail_limit: 5,
  default_page_size: 20,
  audit_log_retention_days: 180
})

const profileRules = {
  display_name: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
}

const confirmPasswordValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
    return
  }
  if (value !== passwordForm.new_password) {
    callback(new Error('两次输入密码不一致'))
    return
  }
  callback()
}

const passwordRules = {
  old_password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少 6 位', trigger: 'blur' }
  ],
  confirm_password: [{ validator: confirmPasswordValidator, trigger: 'blur' }]
}

const loadProfile = async () => {
  const res = await getAdminSettings()
  const payload = res.data || {}
  profileForm.username = payload.username || ''
  profileForm.display_name = payload.display_name || payload.nickname || payload.username || ''
  profileForm.email = payload.email || ''
  profileForm.phone = payload.phone || ''
  profileForm.timezone = payload.timezone || 'Asia/Shanghai'
}

const loadSystemConfig = async () => {
  const res = await getSystemConfig()
  const payload = res.data || {}
  systemForm.site_name = payload.site_name || systemForm.site_name
  systemForm.allow_register = payload.allow_register ?? systemForm.allow_register
  systemForm.login_fail_limit = payload.login_fail_limit || systemForm.login_fail_limit
  systemForm.default_page_size = payload.default_page_size || systemForm.default_page_size
  systemForm.audit_log_retention_days =
    payload.audit_log_retention_days || systemForm.audit_log_retention_days
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  try {
    await profileFormRef.value.validate()
  } catch (error) {
    return
  }

  profileSaving.value = true
  try {
    await updateAdminProfile({
      display_name: profileForm.display_name,
      email: profileForm.email,
      phone: profileForm.phone,
      timezone: profileForm.timezone
    })
    ElMessage.success('资料保存成功')
  } finally {
    profileSaving.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
  } catch (error) {
    return
  }

  passwordSaving.value = true
  try {
    await updateAdminPassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    ElMessage.success('密码更新成功，请使用新密码重新登录')
  } finally {
    passwordSaving.value = false
  }
}

const handleSaveSystem = async () => {
  systemSaving.value = true
  try {
    await updateSystemConfig(systemForm)
    ElMessage.success('系统参数已保存')
  } finally {
    systemSaving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProfile(), loadSystemConfig()])
})
</script>
