import request from '@/utils/request'

export function fetchCmsCategoryList() {
  return request({
    url: '/user/apiExtNewsCategory/list',
    method: 'post',
    data: {}
  })
}

export function delData(id) {
  return request({
    url: '/user/apiExtNewsCategory/del',
    method: 'post',
    data: { id }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtNewsCategory/save',
    method: 'post',
    data: { ...data }
  })
}
