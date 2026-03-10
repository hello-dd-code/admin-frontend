import request from '../utils/request'

// 戒烟记录（fa_smoke_log）
export function listSmokeLogs(params) {
  return request({ url: '/api/admin/smoke/logs', method: 'get', params })
}
export function createSmokeLog(data) {
  return request({ url: '/api/admin/smoke/logs', method: 'post', data })
}
export function updateSmokeLog(id, data) {
  return request({ url: `/api/admin/smoke/logs/${id}`, method: 'put', data })
}
export function deleteSmokeLog(id) {
  return request({ url: `/api/admin/smoke/logs/${id}`, method: 'delete' })
}

// 用户画像（fa_smoke_user_profile）
export function listSmokeProfiles(params) {
  return request({ url: '/api/admin/smoke/profiles', method: 'get', params })
}
export function createSmokeProfile(data) {
  return request({ url: '/api/admin/smoke/profiles', method: 'post', data })
}
export function updateSmokeProfile(id, data) {
  return request({ url: `/api/admin/smoke/profiles/${id}`, method: 'put', data })
}
export function deleteSmokeProfile(id) {
  return request({ url: `/api/admin/smoke/profiles/${id}`, method: 'delete' })
}

// AI 建议（fa_smoke_ai_advice）
export function listSmokeAIAdvices(params) {
  return request({ url: '/api/admin/smoke/ai-advices', method: 'get', params })
}
export function createSmokeAIAdvice(data) {
  return request({ url: '/api/admin/smoke/ai-advices', method: 'post', data })
}
export function updateSmokeAIAdvice(id, data) {
  return request({ url: `/api/admin/smoke/ai-advices/${id}`, method: 'put', data })
}
export function deleteSmokeAIAdvice(id) {
  return request({ url: `/api/admin/smoke/ai-advices/${id}`, method: 'delete' })
}

// AI 解锁（fa_smoke_ai_advice_unlocks）
export function listSmokeAIUnlocks(params) {
  return request({ url: '/api/admin/smoke/ai-unlocks', method: 'get', params })
}
export function createSmokeAIUnlock(data) {
  return request({ url: '/api/admin/smoke/ai-unlocks', method: 'post', data })
}
export function updateSmokeAIUnlock(id, data) {
  return request({ url: `/api/admin/smoke/ai-unlocks/${id}`, method: 'put', data })
}
export function deleteSmokeAIUnlock(id) {
  return request({ url: `/api/admin/smoke/ai-unlocks/${id}`, method: 'delete' })
}

// AI 下次抽烟节点（fa_smoke_ai_next_smoke）
export function listSmokeAINexts(params) {
  return request({ url: '/api/admin/smoke/ai-next-smokes', method: 'get', params })
}
export function createSmokeAINext(data) {
  return request({ url: '/api/admin/smoke/ai-next-smokes', method: 'post', data })
}
export function updateSmokeAINext(id, data) {
  return request({ url: `/api/admin/smoke/ai-next-smokes/${id}`, method: 'put', data })
}
export function deleteSmokeAINext(id) {
  return request({ url: `/api/admin/smoke/ai-next-smokes/${id}`, method: 'delete' })
}

// 激励语模板（fa_smoke_motivation_quote）
export function listSmokeMotivations(params) {
  return request({ url: '/api/admin/smoke/motivation-quotes', method: 'get', params })
}
export function createSmokeMotivation(data) {
  return request({ url: '/api/admin/smoke/motivation-quotes', method: 'post', data })
}
export function updateSmokeMotivation(id, data) {
  return request({ url: `/api/admin/smoke/motivation-quotes/${id}`, method: 'put', data })
}
export function deleteSmokeMotivation(id) {
  return request({ url: `/api/admin/smoke/motivation-quotes/${id}`, method: 'delete' })
}
