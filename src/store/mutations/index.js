/**
 * Created by zzmhot on 2017/3/21.
 *
 * @author: zzmhot
 * @github: https://github.com/zzmhot
 * @email: zzmhot@163.com
 * @Date: 2017/3/21 16:04
 * @Copyright(©) 2017 by zzmhot.
 *
 */
import * as type from 'store/mutations/type'
import {
  cookieStorage
} from 'common/storage'
import {
  port_user,
  port_code
} from "common/port_uri";

export default {
  // 初始化配置
  init_config(state) {
    state.checkpoint = null;
    state.checkpoint_list = null;

    state.question = null;
    state.question_list = null;

    state.record_list = {
      status: 0
    };
  },

  // 设置游戏基础信息
  set_game_config(state, game_config) {
    state.game_config = game_config
    // 初始化关卡信息
    // state.checkpoint_list = state.game_config.checkpoint_list;
  },

  // 获取本地缓存记录
  get_from_local(state) {},

  // 设置游戏记录
  set_record_list(state, record_list) {
    // 初始化记录
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
    if (checkpoint) {
      state.checkpoint = state.game_config.checkpoint_list[checkpoint.id];
    } else {
      state.checkpoint = null;
      state.question = null;
      state.question_list = null;
    }
  },

  // 设置题目
  set_question(state, checkpoint) {
    // 获取题目
    let question = state.game_config.question_list[checkpoint.question];
    if (question.type > 0) {
      // 指定一道题目
      state.question_list = [question];
      state.question = question;
    } else {
      // 设置题库
      this.commit('set_question_list', question.items);

      // 根据记录设置当前题目
      let record = state.record_list.list[checkpoint.id];
      if (record.qid > 0) {
        // 已经记录了题目，设置为当前题目
        state.question = state.game_config.question_list[record.qid];
      } else {
        // 没有记录，从question_list中随机选择一条
        this.commit('set_random_question');
      }
    }
  },

  // 设置当前题目
  set_question_del(state, question) {
    if (question.type > 0) {
      // 指定一道题目
      state.question_list = [question];
      state.question = question;
      return;
    }

    // 设置题库
    this.commit('set_question_list', question.items);

    // 随机选择一条
    this.commit('set_random_question');
    // if ((question.type == 5) || (question.type == 9)) {
    //     // if (question.type == 5) {
    //     // 如果是道具，直接获取
    //     this.commit('answer_question', question.answer);
    //     this.commit('set_task_status', G.ANSWER_COMPLETE); // ANSWER_COMPLETE
    // } else {
    //     // 需要回答问题
    //     this.commit('set_task_status', G.ANSWER_QUESTION); // ANSWER_QUESTION
    // }
  },

  // 随机选择题目
  set_random_question(state) {
    let length = state.question_list.length;
    if (length > 0) {
      // 随机一个index
      let index = Math.floor(Math.random() * length);

      // 更新题目数据
      state.question = state.question_list[index];
    } else {
      state.question = null;
    }
  },

  // 可以使用的题目
  set_question_list(state, list) {
    let question_list = list.split(',');
    // console.log('set_question_list', question_list);
    state.question_list = [];

    for (var key in question_list) {
      let question_id = question_list[key];
      let question = state.game_config.question_list[question_id];

      // 添加到待选的题库列表
      if (question) {
        state.question_list.push(question);
      }
    }
  },

  // 回答问题
  answer_question(state, answer) {
    // console.log('answer_question', answer);
    let question = state.question;
    let mark = 0;
    let success = false;

    // 判断问题是否回答正确
    if ((question.type == 3) || (question.type == 5) || (question.type == 9) || (question.type == 12)) {
      // 照片/道具/任务书/晋级书，直接标记成功
      mark = parseInt(question.mark);
      success = true;
    } else if (answer == question.answer) {
      mark = parseInt(question.mark);
      success = true;
    }

    // 成绩记录
    let record = {
      cid: state.checkpoint.id,
      qid: state.question.id,
      mark: mark,
      success: success,
      answer: answer,
    };
    state.record    = record;
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
