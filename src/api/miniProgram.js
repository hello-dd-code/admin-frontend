import request from '../utils/request'

export function getMiniPrograms(params) {
  return request({
    url: '/api/admin/mini-programs',
    method: 'get',
    params
  })
}

export function getMiniProgramById(id) {
  return request({
    url: `/api/admin/mini-programs/${id}`,
    method: 'get'
  })
}

export function getMiniProgramStatsById(id) {
  return request({
    url: `/api/admin/mini-programs/${id}/stats`,
    method: 'get'
  })
}

export function createMiniProgram(data) {
  return request({
    url: '/api/admin/mini-programs',
    method: 'post',
    data
  })
}

export function updateMiniProgram(id, data) {
  return request({
    url: `/api/admin/mini-programs/${id}`,
    method: 'put',
    data
  })
}

export function deleteMiniProgram(id) {
  return request({
    url: `/api/admin/mini-programs/${id}`,
    method: 'delete'
  })
}
