import request from '@/utils/request'

export function fetchProvinceList() {
  return request({
    url: '/common/region/province',
    method: 'get'
  })
}

export function fetchChildList(pid) {
  return request({
    url: '/common/region/child',
    method: 'get',
    params: { pid }
  })
}
