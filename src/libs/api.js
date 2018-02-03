import axios from 'axios';
axios.defaults.baseURL = 'http://192.168.1.126/'
axios.defaults.withCredentials = true;
axios.defaults.crossDomain = true;


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

const _get = (url, data) => {
  return axios({
    method: 'get',
    url: url,
    params: data,
    timeout: 30000,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
  }).then(checkStatus);
}

const _post = (url, data) => {
  return axios({
    method: 'post',
    url: url,
    data: data,
    timeout: 30000
  }).then(checkStatus);
}

const makeGet = (url) => {
  return (param) => {
    return _get(url, param);
  }
}

const makePost = (url) => {
  return (param) => {
    return _post(url, param);
  }
}

//登录
const login = (param) =>{
    return _post('user/login',param);
}
//搜索
const queryAll = (param)=>{
  return _get('search/query_all',param);
}
//获取用户列表get
const userList = (param)=>{
    return _get('user/profile',param);
}
//网页访问
const internet = (param)=>{
  return _get('collection/internet',param);
}
//即时通讯
const chat =(param)=>{
  return _get('collection/chat',param);
}
//域名访问
const dns =(param)=>{
  return _get('collection/dns',param);
}
//电子邮件
const mail =(param)=>{
  return _get('collection/mail',param);
}
//终端信息
const terminalInfo =(param)=>{
  return _get('collection/terminal',param);
}
//虚拟账号
const arAccount =(param)=>{
  return _get('collection/account_all',param);
}
//连接Wlan
const connectWlan = (param)=>{
  return _post('',param);
}
//退出登录
const logout = (param)=>{
  return _get('/user/logout',param);
}
//获取重点人员
const getPersonList =(param)=>{
  return _get('/Evidence/person_list',param);
}
//添加重点人员
const addPerson = (param)=>{
  return _post('/Evidence/add_person',param);
}
//删除重点人员
const delPerson =(param)=>{
  return _post('/Evidence/remove_person',param);
}
const apscan = (param)=>{
  return _get('/set/scan_ap',param);
}
//添加监控
const addList = (param)=>{
  return _get('/Evidence/embed_horse',param);
}
//获取wlan
const getwlan = (param)=>{
  return _get('/set/get_wlan',param);
}
//创建wifi
const setApWifi = (param)=>{
  return _post('/set/setApWifi',param);
}
//自动获取IP
const netInfo = (param)=>{
  return _get('/set/net_info',param);
}
//获取AP列表
const getScanAp =(param)=>{
  return _get('/set/get_scan_ap',param);
}
//获取当前创建AP信息
const getCurrentApInfo = (param)=>{
  return _get('/set/getApInfo',param);
}
//修改密码
const resetPassWord = (param)=>{
  return _post('/user/profile',param);
}
//添加用户
const addUser = (param)=>{
  return _post('/user/add_user',param);
}
//获取用户列表
const getUserList = (param)=>{
  return _get('/user/user_list',param);
}
//获取wlan0缓存
const getwlanCache = (param)=>{
  return _get('/set/get_wlan_cache',param);
}
//获取木马信息
const getHorseInfo = (param)=>{
  return _get('/Evidence/horse_list',param);
}
//设置木马全局
const setHorseValue = (param)=>{
  return _post('/Evidence/horse_set',param);
}
//获取上线人员列表
const getonLine = (param)=>{
  return _get('/set/user_list',param); 
}
//获取木马设置信息
const getHoreseConf = (param)=>{
  return _get('/Evidence/getHorseConf',param);
}
//修改重点人员
const editPerson = (param)=>{
  return _post('/Evidence/edit_person',param);
}
//删除用户
const delUser = (param)=>{
  return _post('/user/del_user',param);
}
//获取植入日志
const embedLog = (param)=>{
  return _get('/evidence/embed_log',param);
}
//获取Ap创建日志
const getApLog = (param)=>{
  return _get('/set/getApLog',param);
}
//停止Ap
const StopAP = (param) =>{
  return _get('/set/StopAP',param);
}
//修改ip
const changeip = (param)=>{
  return _post('/set/net_set',param);
}
//添加AP到AP库
const addaplib =(param)=>{
  return _post('/set/add_aplib',param);
}
//启用监控
const Monitor = (param)=>{
  return _post('/Evidence/monitor',param);
}
//切换模式
const changeModel = (param)=>{
  return _get('/Access/change_model',param);
}
//获取工作模式
const getModel = (param)=>{
  return _get('/Access/get_model',param);
}
//连接AP
const connectAP = (param)=>{
  return _get('/Access/connect_ap',param);
}
//删除ap
const delAPLib = (param)=>{
  return _get('/set/del_aplib',param);
}
//添加AP到AP库
const addAPInLib = (param)=>{
  return _post('/set/add_aplib',param);
}
//查询
const queryAp = (param)=>{
  return _get('/set/find_ap',param);
}
//修改AP
const editAP = (param)=>{
  return _post('/set/edit_aplib',param);
}
//断开连接
const disConnect = (param)=>{
  return _get('/Access/disconnect',param);
}
export default{
    login,
    logout,
    apscan,
    internet,
    chat,
    dns,
    mail,
    terminalInfo,
    arAccount,
    getPersonList,
    delPerson,
    getwlan,
    setApWifi,
    netInfo,
    getScanAp,
    getCurrentApInfo,
    resetPassWord,
    addUser,
    getUserList,
    getwlanCache,
    getHorseInfo,
    setHorseValue,
    addPerson,
    getonLine,
    getHoreseConf,
    editPerson,
    delUser,
    embedLog,
    getApLog,
    StopAP,
    changeip,
    queryAll,
    addaplib,
    Monitor,
    changeModel,
    getModel,
    connectAP,
    delAPLib,
    addAPInLib,
    queryAp,
    editAP,
    disConnect
}