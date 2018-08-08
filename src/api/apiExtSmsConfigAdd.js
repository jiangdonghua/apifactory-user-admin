import request from '@/utils/request'

export function info(id) {
  return request({
    url: '/user/apiExtSmsConfig/info',
    method: 'get',
    params: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtSmsConfig/save',
    method: 'post',
    data: { ...data }
  })
}
