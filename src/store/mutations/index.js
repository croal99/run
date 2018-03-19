import * as type from 'store/mutations/type'
import {
  cookieStorage
} from 'common/storage'
import {
  port_user,
  port_code
} from "common/port_uri";
import api from "../../api"
// console.log('api', api, api.fetch)
// api.fetch.api_user
//   .get_user_info({
//     code: '1234'
//   })
//   .then(({data}) => {
//     console.log('aaaa', data);
//   });


export default {
  // 初始化配置
  init_task(state) {
    state.task.checkpoint = null;
    state.task.question = null;
    state.task.question_list = null;
    state.task.answer = '';
    state.task.success = false;
  },

  init_config(state) {
    // 初始化当前任务
    this.commit('init_task');
    // 初始化记录
    state.record_list = {
      status: 0
    };
  },

  // 设置游戏基础信息
  set_game_config(state, game_config) {
    state.game_config = game_config
  },

  // 设置游戏基础信息
  set_game_remote(state) {
    api.fetch.api_game_config
      .set_record({
        code: state.game_config.game_code,
        type: 1, // 修改关卡状态
        status: state.record_list.status
      })
      .then(({
        data
      }) => {
        console.log('set_game_remote', data);
      });
  },

  // 获取本地缓存记录
  get_from_local(state) {},

  // 设置游戏记录
  set_record_list(state, record_list) {
    let checkpoint_list = state.game_config.checkpoint_list;

    // 初始化记录
    for (let key in record_list.list) {
      let record = record_list.list[key];
      // console.log('record', record); //这里被调用了两次
      let checkpoint = checkpoint_list[record.cid];
      if (checkpoint) {
        if (record.hasOwnProperty('status')) {
          checkpoint.status = record.status;
        }
        if (record.hasOwnProperty('show')) {
          checkpoint.show = record.show;
        }
      }
    }

    // 根据状态，修改关卡显示图片
    for (let key in checkpoint_list) {
      let checkpoint = checkpoint_list[key];
      switch (checkpoint.status) {
        case 0:
          checkpoint.image = checkpoint.image0;
          break;
        case 1:
          checkpoint.image = checkpoint.image1;
          break;
        case 2:
          checkpoint.image = checkpoint.image2;
          break;
        case 3:
          checkpoint.image = checkpoint.image3;
          break;
        case 4:
          checkpoint.image = checkpoint.image4;
          break;
      }
    }

    state.record_list = record_list;
  },

  // 游戏开始，设置时间
  set_begin_time(state) {
    // state.record_list.begin_time = Date.parse(new Date());
    // state.record_list.status = 2;
    // state.load_status = 2;
    // let game_code = state.game_config.game_code;
    // localStorage.setItem(game_code + '_record_list', JSON.stringify(state.record_list));
  },

  // 设置关卡
  set_checkpoint(state, checkpoint) {
    state.task.checkpoint = state.game_config.checkpoint_list[checkpoint.id];
  },

  // 保存到服务器
  set_checkpoint_remote(state, checkpoint) {
    api.fetch.api_game_config
      .set_record({
        code: state.game_config.game_code,
        type: 2, // 修改关卡状态
        cid: checkpoint.id,
        status: checkpoint.status
      })
      .then(({
        data
      }) => {
        console.log('set_checkpoint_remote', data);
      });
  },

  // 设置题目
  set_question(state, question) {
    console.log('set_question', question);
    // 初始化任务数据
    state.task.answer = '';
    state.task.success = false;

    // 根据题目类型进行处理
    if (question.type == 0) {
      // 从题库中抽取题目
      this.commit('set_question_list', question.items);
      this.commit('set_random_question');
    } else if (question.type == 12) {
      // 保存到任务记录
      state.task.question_list = [question];
      state.task.question = question;
      state.task.success = true;

      // 执行功能
      let item_list = question.items.split(';');
      console.log('item_list', item_list);
      for (let key in item_list) {
        let item = item_list[key];
        let method = item.substr(0, 1);
        let id = item.slice(1);
        let checkpoint = null;
        let question = null;
        console.log(item, method, id);

        switch (method) {
          case '+': // 打开关卡
            checkpoint = state.game_config.checkpoint_list[id];
            checkpoint.show = true;
            this.commit('set_checkpoint_remote', checkpoint)
            break;
          case '-': // 关闭关卡
            checkpoint = state.game_config.checkpoint_list[id];
            checkpoint.show = false;
            this.commit('set_checkpoint_remote', checkpoint)
            break;
          case 's': // 修改关卡状态
            checkpoint = state.task.checkpoint;
            checkpoint.status = id;
            this.commit('set_checkpoint_remote', checkpoint)
            break;
          case '*': // 获得道具
            question = state.game_config.question_list[id];
            // state.record_list.tools.push(question);
            // console.log('tools', question, state.record_list)
            this.commit('set_tools_remote', question)
            break;
          case 'e': // 结束游戏
            state.record_list.status = 3;
            this.commit('set_game_remote')
            break;
        }
      }
      // 保存记录
      this.commit('set_record_remote');

      // 获取下一题
      this.commit('set_next_question', question);
      return; // To-do??
    } else {
      // 指定一道题卡
      state.task.question_list = [question];
      state.task.question = question;
    }

    // 保存当前答题编号
    this.commit('set_question_remote');
  },

  // 获取道具-服务器
  set_tools_remote(state, question) {
    api.fetch.api_game_config
      .set_record({
        code: state.game_config.game_code,
        type: 5, // 记录答题编号
        cid: state.task.checkpoint.id,
        qid: question.id,
      })
      .then(({
        data
      }) => {
        console.log('set_tools_remote', data);
      });
  },

  // 保存到服务器
  set_question_remote(state) {
    api.fetch.api_game_config
      .set_record({
        code: state.game_config.game_code,
        type: 3, // 记录答题编号
        cid: state.task.checkpoint.id,
        qid: state.task.question.id,
      })
      .then(({
        data
      }) => {
        console.log('set_question_remote', data);
      });
  },

  // 设置下一道题目
  set_next_question(state, question) {
    console.log('set_next_question')
    // 下一道题目ID
    let qid = 0;
    if (question.type == 12) {
      qid = question.true_id
    } else {
      qid = state.task.success ? question.true_id : question.false_id;
    }

    if (qid == 0) {
      state.task.question = null;
      state.task.question_list = [];
      return;
    }

    let next_question = state.game_config.question_list[qid];
    this.commit('set_question', next_question);
  },

  set_question_1(state) {
    // 获取题目
    let checkpoint = state.checkpoint;
    let question = state.game_config.question_list[checkpoint.question];

    if (question.type > 0) {
      // 指定一道题卡
      state.question_list = [question];
      state.question = question;
    } else {
      // 设置题库
      this.commit('set_question_list', question.items);

      // 根据记录设置当前题目
      if (record.qid > 0) {
        // 已经记录了题目，设置为当前题目
        state.question = state.game_config.question_list[record.qid];
      } else {
        // 没有记录，从question_list中随机选择一条
        this.commit('set_random_question');
      }
    }

    // 解析题卡
    let record = state.record_list.list[checkpoint.id];
    record.qid = state.question.id;
  },

  // 随机选择题目
  set_random_question(state) {
    let length = state.task.question_list.length;
    if (length > 0) {
      // 随机一个index
      let index = Math.floor(Math.random() * length);
      // 更新题目数据
      state.task.question = state.task.question_list[index];
    } else {
      state.task.question = null;
    }
  },

  // 可以使用的题目
  set_question_list(state, list) {
    let question_list = list.split(',');
    // console.log('set_question_list', question_list);
    state.task.question_list = [];

    for (var key in question_list) {
      let question_id = question_list[key];
      let question = state.game_config.question_list[question_id];

      // 添加到待选的题库列表
      if (question) {
        state.task.question_list.push(question);
      }
    }
  },

  // 回答问题
  answer_question(state, answer) {
    // console.log('answer_question', answer);
    let question = state.task.question;

    // 默认成绩
    state.task.mark = 0;
    state.task.success = false;

    // 判断问题是否回答正确
    if ((question.type == 3) || (question.type == 5) || (question.type == 9) || (question.type == 12)) {
      // 照片/道具/任务书/晋级书，直接标记成功
      state.task.mark = parseInt(question.mark);
      state.task.success = true;
    } else if (answer == question.answer) {
      state.task.mark = parseInt(question.mark);
      state.task.success = true;
    }

    // 保存记录
    this.commit('set_record_remote');
  },

  // 保存到服务器
  set_record_remote(state) {
    let record = {
      cid: state.task.checkpoint.id,
      qid: state.task.question.id,
      answer: state.task.answer,
      success: state.task.success
    }
    api.fetch.api_game_config
      .set_record({
        code: state.game_config.game_code,
        type: 4, // 记录答题内容
        record: record,
      })
      .then(({
        data
      }) => {
        console.log('set_record_remote', data);
      });
  },

  // 设置用户信息和是否登录
  [type.SET_USER_INFO](state, user_info) {
    state.user_info = user_info
    if (user_info === null) {
      cookieStorage.remove('user_info')
    } else {
      cookieStorage.set('user_info', user_info)
    }
  }
}
