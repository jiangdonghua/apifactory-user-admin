import request from '@/utils/request'

export function info(id) {
  return request({
    url: '/user/apiExtUserShippingAddress/info',
    method: 'get',
    params: { id }
  })
}

export function getProvince() {
  return request({
    url: '/common/region/province',
    method: 'get'
  })
}

export function getChild(pid) {
  return request({
    url: '/common/region/child',
    method: 'get',
    params:{pid:pid}
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtUserShippingAddress/save',
    method: 'post',
    data: { ...data }
  })
}
