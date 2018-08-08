import request from '@/utils/request'

export function fetchDataList(data) {
  return request({
    url: '/user/apiExtSmsConfig/list',
    method: 'post',
    data: {
      ...data
    }
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtSmsConfig/del',
    method: 'post',
    data: { id }
  })
}
