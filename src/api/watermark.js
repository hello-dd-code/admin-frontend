import request from '../utils/request'

export function getWatermarkOverview() {
  return request({
    url: '/api/admin/watermark/overview',
    method: 'get'
  })
}

export function getWatermarkTasks(params) {
  return request({
    url: '/api/admin/watermark/tasks',
    method: 'get',
    params
  })
}

export function retryWatermarkTask(id) {
  return request({
    url: `/api/admin/watermark/tasks/${id}/retry`,
    method: 'post'
  })
}

export function deleteWatermarkTask(id) {
  return request({
    url: `/api/admin/watermark/tasks/${id}`,
    method: 'delete'
  })
}
