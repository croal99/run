/**
 * @file: media.
 * @intro: 媒体文件管理.
 * @author: xpchen.
 * @Date: 2017/5/8 15:31.
 * @Copyright(©) 2017 by zzmhot.
 *
 */

import fetch from 'common/fetch'
import {port_media} from 'common/port_uri'

// 获取图片文件列表
export function picture_list(data) {
  return fetch({
    url: port_media.picture_list,
    method: 'get',
    data
  })
}
