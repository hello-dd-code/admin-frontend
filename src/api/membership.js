import request from '../utils/request'

export function getMembershipOverview() {
  return request({
    url: '/api/admin/memberships/overview',
    method: 'get'
  })
}

export function getMembershipRedeemCodes(params) {
  return request({
    url: '/api/admin/memberships/redeem-codes',
    method: 'get',
    params
  })
}

export function createMembershipRedeemCodes(data) {
  return request({
    url: '/api/admin/memberships/redeem-codes',
    method: 'post',
    data
  })
}

export function updateMembershipRedeemCodeStatus(id, data) {
  return request({
    url: `/api/admin/memberships/redeem-codes/${id}/status`,
    method: 'post',
    data
  })
}
