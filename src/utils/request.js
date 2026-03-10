import axios from 'axios'
import { ElMessage } from 'element-plus'

const loginPath = `${import.meta.env.BASE_URL}login`

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 兼容后端 code=200（当前）和 code=0（旧约定）
    if (res.code !== 200 && res.code !== 0) {
      ElMessage.error(res.message || '请求失败')

      // 401: 未登录
      if (res.code === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = loginPath
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    console.error('请求错误:', error)

    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('admin_token')
        window.location.href = loginPath
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status === 500) {
        ElMessage.error('服务器错误')
      } else {
        ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

export default request
