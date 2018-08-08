import request from '@/utils/request'

export function fetchDataList() {
  return request({
    url: '/user/kefuMember/list',
    method: 'post'
  })
}

export function fetchQrcode() {
  return request({
    url: '/user/kefuMember/qrcode',
    method: 'get'
  })
}

export function enable(id) {
  return request({
    url: '/user/kefuMember/enable',
    method: 'post',
    data: { id }
  })
}

export function disable(id) {
  return request({
    url: '/user/kefuMember/disable',
    method: 'post',
    data: { id }
  })
}

export function delData(id) {
  return request({
    url: '/user/kefuMember/del',
    method: 'post',
    data: { id }
  })
}
