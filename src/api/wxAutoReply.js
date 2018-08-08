import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/wxAutoReply/list',
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
    url: '/user/wxAutoReply/info',
    method: 'get',
    params: { id }
  })
}

export function delData(id) {
  return request({
    url: '/user/wxAutoReply/del',
    method: 'post',
    data: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/wxAutoReply/save',
    method: 'post',
    data: { ...data }
  })
}
