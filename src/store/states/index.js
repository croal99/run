import {
  cookieStorage
} from 'common/storage'

const state = {
  user_info: { // 用户基础信息
    login: false // 是否登录
  },
  game_config: null, // 游戏基础配置
  position: { // 当前位置坐标（GPS）
    lng: 0,
    lat: 0,
    acc: 0,
    time: 0,
  },
  task: { // 当前任务记录（需要随时保存）
    checkpoint: null,
    question: null,
    question_list: null,
    answer: '',
    success: false,
    multi_shake_count: 0, // 多人摇一摇进度
  },
  change_checkpoint_list: [],  // 变更状态的关卡
  
  // question: null,           // 当前题目
  // question_list: null,      // 待选题库
  // record_list: { // 游戏完成情况（需要随时保存）
  //   status: 0, // 1--welcome 2--running 3--ending
  //   mark: 0, // 成绩
  //   time: 0, // 耗时
  //   begin_time: 0, // 开始时间
  //   end_time: 0, // 结束时间
  //   list: [], // 完成记录(cid,qid,status)
  //   tools: [], // 获得的道具
  // },
  //   record_checkpoint: {      // 记录中的list，无实际数据
  //       cid: 0,                 // checkpoint id
  //       status: 0,              // 0--未开启 1--选中目标 2--到达位置 3--完成（成功） 4--完成（失败）
  //       time: 0,                // 时间
  //       question_list: {        // 题目完成情况
  //           qid: 0,                 // question id
  //           mark: 0,                // 得分
  //           success: false,         // 是否成功（可能成功后没有得分）
  //           answer: '',             // 答案
  //           time: 0,                // 答题时间
  //       }
  //   },

  //   load_status: 0,         // 加载进度
  weixin_status: false, // 微信授权状态
  ws: null, // WebSocket
};

export default state
