import request from '../utils/request'

/**
 * 管理员登录
 */
export function login(username, password) {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data: { username, password }
  })
}

/**
 * 获取管理员信息
 */
export function getProfile() {
  return request({
    url: '/api/admin/profile',
    method: 'get'
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/api/admin/logout',
    method: 'post'
  })
}
