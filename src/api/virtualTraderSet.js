import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/virtualTraderSet/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}

export function infoData(id) {
  return request({
    url: '/user/virtualTraderSet/info',
    method: 'get',
    params: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/virtualTraderSet/save',
    method: 'post',
    data: { ...data }
  })
}

export function delData(id) {
  return request({
    url: '/user/virtualTraderSet/del',
    method: 'post',
    data: { id }
  })
}
