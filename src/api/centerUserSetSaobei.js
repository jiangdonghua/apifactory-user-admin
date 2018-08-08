import request from '@/utils/request'

export function info() {
  return request({
    url: '/user/centerUserSetSaobei/info',
    method: 'get'
  })
}

export function delData() {
  return request({
    url: '/user/centerUserSetSaobei/del',
    method: 'post'
  })
}

export function saveData(data) {
  return request({
    url: '/user/centerUserSetSaobei/save',
    method: 'post',
    data: { ...data }
  })
}
