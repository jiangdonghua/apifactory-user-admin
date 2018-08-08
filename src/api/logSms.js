import request from '@/utils/request'

export function fetchDataList(data) {
  return request({
    url: '/user/logSms/list',
    method: 'post',
    data: {
      ...data
    }
  })
}
