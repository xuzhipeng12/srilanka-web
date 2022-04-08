import request from '@/utils/request'

export function fetchSwitchList(query) {
  return request({
    url: '/api/switch/list',
    method: 'get',
    params: query
  })
}

export function fetchSwitchById(query) {
  return request({
    url: '/api/switch/share',
    method: 'get',
    params: query
  })
}

export function createSwitch(data) {
  return request({
    url: '/api/switch/add',
    method: 'post',
    data
  })
}

export function updateSwitch(data) {
  return request({
    url: '/api/switch/update',
    method: 'post',
    data
  })
}

export function deleteSwitch(data) {
  return request({
    url: '/api/switch/delete',
    method: 'post',
    data
  })
}
