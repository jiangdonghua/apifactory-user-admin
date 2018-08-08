import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/apiExtNews/list',
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
    url: '/user/apiExtNews/info',
    method: 'get',
    params: { id }
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtNews/del',
    method: 'post',
    data: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtNews/save',
    method: 'post',
    data: { ...data }
  })
}
