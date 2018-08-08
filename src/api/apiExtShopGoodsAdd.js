import request from '@/utils/request'

export function info(id) {
  return request({
    url: '/user/apiExtShopGoods/info',
    method: 'get',
    params: {id}
  })
}

export function getShopData() {
  return request({
    url: '/user/apiExtShopSub/list',
    method: 'post',
    data: {}
  })
}

export function getGoodsCategoryData() {
  return request({
    url: '/user/apiExtShopGoodsCategory/list',
    method: 'post',
    data: {}
  })
}

export function getFreightTemplate() {
  return request({
    url: '/user/apiExtShopFreightTemplate/list',
    method: 'post',
    data: {}
  })
}

export function getProperty() {
  return request({
    url: 'user/apiExtShopProperty/list',
    method: 'post',
    data: {}
  })
}

export function getPropertyChild(propertyId) {
  return request({
    url: '/user/apiExtShopProperty/childs',
    method: 'post',
    data: {propertyId}
  })
}


export function saveData(data) {
  return request({
    url: '/user/apiExtShopGoods/save',
    method: 'post',
    data: {...data}
  })
}
