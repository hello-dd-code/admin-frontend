import request from '../utils/request'

export function getExpirySummary() {
  return request({
    url: '/api/admin/expiry/summary',
    method: 'get'
  })
}

export function getExpiryItems(params) {
  return request({
    url: '/api/admin/expiry/items',
    method: 'get',
    params
  })
}

export function createExpiryItem(data) {
  return request({
    url: '/api/admin/expiry/items',
    method: 'post',
    data
  })
}

export function updateExpiryItem(id, data) {
  return request({
    url: `/api/admin/expiry/items/${id}`,
    method: 'put',
    data
  })
}

export function deleteExpiryItem(id) {
  return request({
    url: `/api/admin/expiry/items/${id}`,
    method: 'delete'
  })
}

export function updateExpiryItemStatus(id, status) {
  return request({
    url: `/api/admin/expiry/items/${id}/status`,
    method: 'post',
    data: { status }
  })
}
