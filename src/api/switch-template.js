import request from '@/utils/request'

export function fetchSwitchTemplateList(query) {
  return request({
    url: '/api/switch/template/list',
    method: 'get',
    params: query
  })
}

export function createSwitchTemplate(data) {
  return request({
    url: '/api/switch/template/add',
    method: 'post',
    data
  })
}

export function updateSwitchTemplate(data) {
  return request({
    url: '/api/switch/template/update',
    method: 'post',
    data
  })
}

export function deleteSwitchTemplate(data) {
  return request({
    url: '/api/switch/template/delete',
    method: 'post',
    data
  })
}
