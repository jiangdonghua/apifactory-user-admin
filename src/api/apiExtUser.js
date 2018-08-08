import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/apiExtUser/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}

export function info(id) {
  return request({
    url: '/user/apiExtUser/info',
    method: 'get',
    params: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtUser/modify',
    method: 'post',
    data: { ...data }
  })
}
export function importFromWX() {
  return request({
    url: '/user/apiExtUser/importFromWX',
    method: 'post'
  })
}


export function delData(id) {
  return request({
    url: '/user/apiExtUser/del',
    method: 'post',
    data: { id }
  })
}
