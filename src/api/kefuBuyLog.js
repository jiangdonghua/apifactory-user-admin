import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/kefuBuyLog/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}

export function setSuccess(id) {
  return request({
    url: '/user/kefuBuyLog/success',
    method: 'post',
    data: {
      id
    }
  })
}