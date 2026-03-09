import request from '../utils/request'

export function getAdminSettings() {
  return request({
    url: '/api/admin/settings',
    method: 'get'
  })
}

export function updateAdminProfile(data) {
  return request({
    url: '/api/admin/settings/profile',
    method: 'put',
    data
  })
}

export function updateAdminPassword(data) {
  return request({
    url: '/api/admin/settings/password',
    method: 'put',
    data
  })
}

export function getSystemConfig() {
  return request({
    url: '/api/admin/settings/system',
    method: 'get'
  })
}

export function updateSystemConfig(data) {
  return request({
    url: '/api/admin/settings/system',
    method: 'put',
    data
  })
}
