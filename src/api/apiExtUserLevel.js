import request from '@/utils/request'

export function fetchAllUserLevels(page, pageSize, data) {
  return request({
    url: '/user/apiExtUserLevel/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}

export function infoData(id) {
  return request({
    url: '/user/apiExtUserLevel/info',
    method: 'get',
    params: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtUserLevel/save',
    method: 'post',
    data: { ...data }
  })
}
export function delData(id) {
  return request({
    url: '/user/apiExtUserLevel/del',
    method: 'post',
    data:{id}
  })
}
