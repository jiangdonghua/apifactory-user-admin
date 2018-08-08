import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/apiExtOrderEvaluate/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}

export function saveData(data) {
  return request({
    url: '/user/apiExtOrderEvaluate/save',
    method: 'post',
    data: { ...data }
  })
}
