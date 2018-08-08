import request from '@/utils/request'

export function fetchDataList(data) {
  return request({
    url: '/user/apiExtShopSub/list',
    method: 'post',
    data: {
      ...data
    }
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtShopSub/del',
    method: 'post',
    data: { id }
  })
}
