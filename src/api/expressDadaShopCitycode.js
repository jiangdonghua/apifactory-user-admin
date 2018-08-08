import request from '@/utils/request'

export function fetchDataList() {
  return request({
    url: '/user/expressDadaShopCitycode/list',
    method: 'get'
  })
}

export function fetchCityList() {
  return request({
    url: '/user/expressDadaShopCitycode/cityList',
    method: 'get'
  })
}

export function saveData(data) {
  return request({
    url: '/user/expressDadaShopCitycode/save',
    method: 'post',
    data: { ...data }
  })
}

export function delData(id) {
  return request({
    url: '/user/expressDadaShopCitycode/del',
    method: 'post',
    data: { id }
  })
}
