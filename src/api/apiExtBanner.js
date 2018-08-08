import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/apiExtBanner/list',
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
    url: '/user/apiExtBanner/info',
    method: 'get',
    params: { id }
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtBanner/del',
    method: 'post',
    data: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtBanner/save',
    method: 'post',
    data: { ...data }
  })
}
