import request from '@/utils/request'

export function fetchDataList(page, pageSize) {
  return request({
    url: '/user/apiExtShopProperty/list',
    method: 'post',
    data: {
      page,
      pageSize
    }
  })
}

export function fetchDataChilds(propertyId) {
  return request({
    url: '/user/apiExtShopProperty/childs',
    method: 'post',
    data: {
      propertyId
    }
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtShopProperty/del',
    method: 'post',
    data: { id }
  })
}

export function delChildData(id) {
  return request({
    url: '/user/apiExtShopProperty/del/child',
    method: 'post',
    data: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtShopProperty/save',
    method: 'post',
    data: { ...data }
  })
}

export function saveChildData(data) {
  return request({
    url: '/user/apiExtShopProperty/save/child',
    method: 'post',
    data: { ...data }
  })
}
