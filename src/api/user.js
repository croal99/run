/**
 * @file: user.
 * @intro: 用户请求数据配置.
 * @author: zzmhot.
 * @email: zzmhot@163.com.
 * @Date: 2017/5/8 15:18.
 * @Copyright(©) 2017 by zzmhot.
 *
 */

import fetch from 'common/fetch'
import {port_user} from 'common/port_uri'

//登录
export function login(data) {
  return fetch({
    url: port_user.login,
    method: 'post',
    data
  })
}

//登出
export function logout() {
  return fetch({
    url: port_user.logout,
    method: 'post'
  })
}

// 用户信息
export function get_user_info(data) {
  if (process.env.NODE_ENV == 'development') {
    data.id   = 'opQHAw9zQsumOAvkeJMSQ-ESNZgk'
  }
  return fetch({
    url: port_user.get_userinfo,
    method: 'post',
    data
  })
}

// 用户认证
export function user_auth(data) {
  if (process.env.NODE_ENV == 'development') {
    data.id   = 'opQHAw9zQsumOAvkeJMSQ-ESNZgk'
  }
  return fetch({
    url: port_user.user_auth,
    method: 'post',
    data
  })
}

// 获取get_package配置
export function get_package(data) {
  // console.log('get_package', data);
  return fetch({
    url: port_user.get_package,
    method: 'get',
    params: data,
  })
}

