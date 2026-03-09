import request from '../utils/request'

export function getOverviewStats() {
  return request({
    url: '/api/admin/stats/overview',
    method: 'get'
  })
}

export function getMiniProgramStats() {
  return request({
    url: '/api/admin/stats/mini-programs',
    method: 'get'
  })
}

export function getUserGrowth(days = 7) {
  return request({
    url: '/api/admin/stats/user-growth',
    method: 'get',
    params: { days }
  })
}
