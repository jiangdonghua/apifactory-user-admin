import request from '@/utils/request'

export function curMenu() {
  return request({
    url: '/user/wxMenu/curMenu',
    method: 'get'
  })
}

export function setMenu(content) {
  return request({
    url: '/user/wxMenu/setMenu',
    method: 'post',
    data: { content }
  })
}
