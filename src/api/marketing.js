import request from '../utils/request'

export function getMarketingStats() {
  return request({
    url: '/api/admin/marketing/stats',
    method: 'get'
  })
}

export function getMarketingCategories() {
  return request({
    url: '/api/admin/marketing/categories',
    method: 'get'
  })
}

export function createMarketingCategory(data) {
  return request({
    url: '/api/admin/marketing/categories',
    method: 'post',
    data
  })
}

export function updateMarketingCategory(id, data) {
  return request({
    url: `/api/admin/marketing/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteMarketingCategory(id) {
  return request({
    url: `/api/admin/marketing/categories/${id}`,
    method: 'delete'
  })
}

export function getMarketingTemplates(params) {
  return request({
    url: '/api/admin/marketing/templates',
    method: 'get',
    params
  })
}

export function createMarketingTemplate(data) {
  return request({
    url: '/api/admin/marketing/templates',
    method: 'post',
    data
  })
}

export function updateMarketingTemplate(id, data) {
  return request({
    url: `/api/admin/marketing/templates/${id}`,
    method: 'put',
    data
  })
}

export function deleteMarketingTemplate(id) {
  return request({
    url: `/api/admin/marketing/templates/${id}`,
    method: 'delete'
  })
}
