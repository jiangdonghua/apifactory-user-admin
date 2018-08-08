import request from '@/utils/request'

export function fetchDataList() {
  return request({
    url: '/user/apiExtShopFreightTemplate/list',
    method: 'post',
    data: {}
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtShopFreightTemplate/del',
    method: 'post',
    data: { id }
  })
}

export function infoData(id) {
  return request({
    url: '/user/apiExtShopFreightTemplate/info',
    method: 'get',
    params: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtShopFreightTemplate/save',
    method: 'post',
    data: { ...data }
  })
}
