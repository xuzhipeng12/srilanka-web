import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/sys/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/sys/logout',
    method: 'post'
  })
}

export function fetchUserList(query) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: '/api/user/add',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/api/user/update',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/api/user/delete',
    method: 'post',
    data
  })
}
