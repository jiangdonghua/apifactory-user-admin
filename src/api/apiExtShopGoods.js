import request from '@/utils/request'

export function fetchDataList(data) {
  return request({
    url: '/user/apiExtShopGoods/list',
    method: 'post',
    data: {...data}
  })
}

export function getShopData() {
  return request({
    url: '/user/apiExtShopSub/list',
    method: 'post',
    data: {}
  })
}

export function getShopGoodsCategoryData() {
  return request({
    url: '/user/apiExtShopGoodsCategory/list',
    method: 'post',
    data: {}
  })

}

export function delData(id) {
  return request({
    url: '/user/apiExtShopGoods/del',
    method: 'post',
    data: { id }
  })
}

export function modifyNumberOrders(data) {
  return request({
    url: '/user/apiExtShopGoods/modify/numberOrders',
    method: 'post',
    data: data
  })
}

export function infoData(id) {
  return request({
    url: '/user/apiExtShopGoods/info',
    method: 'get',
    params: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtShopGoods/save',
    method: 'post',
    data: { ...data }
  })
}

export function rebate(id) {
  return request({
    url: '/user/apiExtShopGoods/rebate',
    method: 'get',
    params: { id }
  })
}

export function saveRebate(data) {
  return request({
    url: '/user/apiExtShopGoods/rebate/save',
    method: 'post',
    data: { ...data }
  })
}