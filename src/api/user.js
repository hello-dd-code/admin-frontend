import request from '../utils/request'

export function getUsers(params) {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params
  })
}

export function getUserById(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'get'
  })
}
