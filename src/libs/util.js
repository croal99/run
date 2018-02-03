import axios from 'axios';
import config from '../config/config';
import Env from '../config/env';

let util = {

};
util.title = function (title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = '蜂寻';
};

const ajaxUrl = config.url;

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
});

// 获取游戏配置
util.get_config = (code) => {
    let url = '/api3/debug';
    // var url = '/api3/config';
    let data = {
        'code': code
    };
    return util.ajax({
        url: url,
        method: 'get',
        params: data,
    }).then(checkStatus);
}

// 获取微信用户信息
util.get_userinfo = () => {
    let url = '/api3/get_userinfo';
    // return util.ajax({
    //     url: url,
    //     method: 'get',
    // }).then(checkStatus);
    if (Env === 'development') {
        let data = {
            'id': 'opQHAw5hx3r8F6IbK0itzOGjDIBM'
        };
        return util.ajax({
            url: url,
            method: 'get',
            params: data,
        }).then(checkStatus);
    } else {
        return util.ajax({
            url: url,
            method: 'get',
        }).then(checkStatus);
    }
}

// 获取用户列表
util.get_user_list = (code) => {
    let url = '/api3/get_user_list';
    let data = {
        'code': code,
    };

    return util.ajax({
        url: url,
        method: 'get',
        params: data,
    }).then(checkStatus);
}

// 获取微信SDK参数
util.get_package = (path) => {
    var url = '/api3/get_package';
    var data = {
        'path': path
    };

    return util.ajax({
        url: url,
        method: 'get',
        params: data,
    }).then(checkStatus);
}

// 微信资源下载
util.download_media = (id) => {
    var url = '/api3/download_media';
    var data = {
        'id': id
    };

    return util.ajax({
        url: url,
        method: 'get',
        params: data,
    }).then(checkStatus);
}

function checkStatus(response) {
    if (response.status === 200 || response.status === 304) {
        if (!response.status) {
            alert(response.desc);
            throw response.desc;

        }
        return response = response.data;
    }
    alert('服务器返回错误');
    throw '服务器返回错误';
}

export default util;