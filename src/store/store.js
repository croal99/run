import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';

//声明一个状态state
Vue.use(Vuex);

const state = {
    userinfo: null,     // 用户基础信息
    game_config: null,  // 游戏基础配置
    position: {         // 当前位置坐标（GPS）
        lng: 0,
        lat: 0,
        acc: 0,
        time: 0,
    }, 
    task: {             // 当前任务记录（需要随时保存）
        status: 0,
        cid: null,
        qid: null,
        answer: '',
        success: false,
        multi_shake_count: 0,   // 多人摇一摇进度
    }, 
    record: {               // 游戏完成情况（需要随时保存）
        mark: 0,            // 成绩
        time: 0,            // 耗时
        begin_time: 0,      // 开始时间
        list: [],           // 题目完成记录
        tools: [],          // 获得的道具
        maps: [],           // 地图显示关卡
    }, 
    checkpoint: null,       // 当前关卡
    checkpoint_list: null,  // 可以使用关卡列表
    question: null,         // 当前题目
    question_list: null,    // 待选题库
    load_status: 0,         // 加载进度
    weixin_status: false,   // 微信授权状态
    ws: null,               // WebSocket
};

const getters = {
    showLoading(state) {
        return state.showLoading;
    }
};

export default new Vuex.Store({
    state,
    mutations,
    getters,
});