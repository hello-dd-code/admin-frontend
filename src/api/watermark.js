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

export function getVideoParseLogs(params) {
  return request({
    url: '/api/admin/watermark/video-parse-logs',
    method: 'get',
    params
  })
}

export function getVideoParseUnlocks(params) {
  return request({
    url: '/api/admin/watermark/video-parse-unlocks',
    method: 'get',
    params
  })
}

export function getVideoDownloadFailures(params) {
  return request({
    url: '/api/admin/watermark/video-download-failures',
    method: 'get',
    params
  })
}
