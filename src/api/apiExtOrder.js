import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/apiExtOrder/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}

export function fetchExpressCompanies() {
  return request({
    url: '/user/apiExtOrder/expressCompanies',
    method: 'get'
  })
}

export function traces(id) {
  return request({
    url: '/user/apiExtOrder/traces',
    method: 'get',
    params: { id }
  })
}

export function orderDetails(id) {
  return request({
    url: '/user/apiExtOrder/detail',
    method: 'get',
    params: { id }
  })
}

export function goLingTong() {
  return request({
    url: '/user/apiExtOrder/goLingTong',
    method: 'get'
  })
}

export function closeOrder(data) {
  return request({
    url: '/user/apiExtOrder/close',
    method: 'post',
    data: { ...data }
  })
}

export function changePrice(data) {
  return request({
    url: '/user/apiExtOrder/changePrice',
    method: 'post',
    data: { ...data }
  })
}

export function payOrder(data) {
  return request({
    url: '/user/apiExtOrder/pay',
    method: 'post',
    data: { ...data }
  })
}

export function payOrderOff(data) {
  return request({
    url: '/user/apiExtOrder/pay/offline',
    method: 'post',
    data: { ...data }
  })
}

export function fahuo(data) {
  return request({
    url: '/user/apiExtOrder/fahuo',
    method: 'post',
    data: { ...data }
  })
}

export function fahuoDada(data) {
  return request({
    url: '/user/apiExtOrder/fahuo/dada',
    method: 'post',
    data: { ...data }
  })
}

export function successOrder(data) {
  return request({
    url: '/user/apiExtOrder/success',
    method: 'post',
    data: { ...data }
  })
}

export function delOrder(id) {
  return request({
    url: '/user/apiExtOrder/del',
    method: 'post',
    data: { id }
  })
}

export function orderRefund(data) {
  return request({
    url: '/user/apiExtOrder/refund',
    method: 'post',
    data: { ...data }
  })
}

export function refuse(id, applyId) {
  return request({
    url: '/user/apiExtOrder/refuse',
    method: 'post',
    data: { id, applyId }
  })
}

export function refuseing(id, applyId) {
  return request({
    url: '/user/apiExtOrder/refuseing',
    method: 'post',
    data: { id, applyId }
  })
}

export function refuseSuccess(id, applyId) {
  return request({
    url: '/user/apiExtOrder/refuseSuccess',
    method: 'post',
    data: { id, applyId }
  })
}