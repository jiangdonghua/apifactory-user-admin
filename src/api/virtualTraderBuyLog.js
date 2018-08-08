import request from '@/utils/request'

export function fetchDataList(page, pageSize, data) {
  return request({
    url: '/user/virtualTraderBuyLog/list',
    method: 'post',
    data: {
      page,
      pageSize,
      ...data
    }
  })
}
