import G from '../config/global';

export default {
    // 初始化配置
    init_config(state) {
        // state.load_status = 0; // 等待读取数据

        state.checkpoint = null;
        state.checkpoint_list = null;

        state.question = null;
        state.question_list = null;

        state.record.mark = 0;
        state.record.time = 0;
        state.record.begin_time = 0;
        // state.record.time = 0;
        state.record.list = [];
        state.record.maps = [];
        state.record.tools = [];

        state.task.cid = null;
        state.task.qid = null;
        state.task.status = 0;
        state.task.success = false;
        state.task.answer = '';
        state.task.multi_shake_count = 0;
    },

    // 获取本地缓存记录
    get_from_local(state) {
        // console.log('get_from_local', state.game_config);
        var game_code = state.game_config.game_code; // 游戏编码
        var checkpoint_list = state.game_config.checkpoint_list;

        // 游戏关卡
        state.checkpoint_list = checkpoint_list;

        // 初始化task
        var task = JSON.parse(localStorage.getItem(game_code + '_task'));
        if (task) {
            while (true) {
                // 更新关卡使用状态信息
                if (task.cid) {
                    let checkpoint = state.checkpoint_list[task.cid];
                    // console.log(checkpoint);
                    if (checkpoint) {
                        checkpoint.status = 1;
                        state.checkpoint = checkpoint;
                    }
                    else {
                        // 关卡信息错误
                        break;
                    }
                }

                // 更新题目信息
                if (state.task.qid) {
                    let question = state.game_config.question_list[task.qid];
                    if (question) {
                        state.question = question;
                        state.question_list = [question];
                    }
                    else {
                        // 题目信息错误，重置关卡信息
                        state.checkpoint.status = 0;
                        break;
                    }
                }
                state.task = task;
                break;
            }
        }

        // record_list
        let record = JSON.parse(localStorage.getItem(game_code + '_record_list'));
        if (record) {
            state.record = record;
        }

        // 初始化记录
        // state.record.mark = 0;
        // state.record.time = 0;
        // state.record.list = [];
        // state.record.tools = [];
        // state.record.maps = [];

        // 凡是有记录的关卡，都是已经完成的
        // console.log('record', state.record, state.record.list);
        for (var key in state.record.list) {
            // console.log('record', key, record);
            let record = state.record.list[key];
            let checkpoint = state.checkpoint_list[record.cid];
            if (checkpoint) {
                checkpoint.status = 2;
            }
            // 计算成绩
            if (record.success) {
                let question = state.game_config.question_list[record.qid];
                if (question) {
                    state.record.mark += parseInt(question.mark);
                }
            }
        }

        // 已经获得的可以显示关卡
        for (key in state.record.maps) {
            let cid = state.record.maps[key];
            let checkpoint = checkpoint_list[cid];
            if (checkpoint == undefined) {
                continue;
            }
            checkpoint.show = true;
        }

        // 数据读取完毕
        state.load_status = 1;
    },

    // 游戏开始，设置时间
    set_begin_time(state) {
        state.record.begin_time = Date.parse(new Date());
        var game_code = state.game_config.game_code;
        localStorage.setItem(game_code + '_record_list', JSON.stringify(state.record));
    },

    // 游戏结束，设置时间
    set_end_time(state) {},

    // 设置本地位置坐标
    set_coords(state, coords) {
        var timestamp = Date.parse(new Date());
        state.position.lng = coords.lng;
        state.position.lat = coords.lat;
        state.position.acc = coords.acc;
        state.position.time = timestamp;
    },

    // 设置远程位置坐标
    set_coords_remote(state) {
        if (state.ws.readyState != 1) {
            return;
        }
        if (state.userinfo == undefined) {
            return;
        }

        let send_data = {
            type: 'control',
            user_id: state.userinfo.openid,
            game_id: state.userinfo.game_code,
            client: 'fengxun',
            client_type: 'game',
            target_id: 'ob',
            message: {
                type: 'coords',
                coords: state.position
            }
        };

        let send_json = JSON.stringify(send_data);
        state.ws.send(send_json);
    },

    // 增加一个关卡数据到地图
    add_checkpoint_map(state, cid) {
        // 检查数据合法性
        var checkpoint = state.checkpoint_list[cid];
        if (checkpoint == undefined) {
            return;
        }

        // 检查是否有显示道具
        for (var key in state.record.tools) {
            var qid = state.record.tools[key];
            var question = state.game_config.question_list[qid];
            if (question.items == 'x01') {
                // 使用道具，增加显示属性，
                state.record.tools.splice(key, 1); // 使用该道具（删除该道具）
                checkpoint.show = true;

                // 添加到显示列表
                state.record.maps.push(cid);

                // 保存到本地
                var game_code = state.game_config.game_code;
                localStorage.setItem(game_code + '_record_list', JSON.stringify(state.record));

                return;
            }
        }
    },

    // 放弃任务
    abort_task(state) {
        state.checkpoint.status = 0;
        this.commit('init_task');
    },

    // 初始化任务信息
    init_task(state) {
        // 初始化状态
        state.checkpoint = null;
        state.question = null;
        state.question_list = null;

        state.task.cid = null;
        state.task.qid = null;
        state.task.success = false;
        state.task.answer = '';
        state.task.multi_shake_count = 0;

        // 保存状态
        this.commit('set_task_status', 0);
    },

    // 设置任务状态 0--初始化 1--寻找关卡 2--答题 3--答题完毕
    set_task_status(state, status) {
        state.task.status = status;

        // 保存当前任务
        var game_code = state.game_config.game_code;
        localStorage.setItem(game_code + '_task', JSON.stringify(state.task));
    },

    // 设置当前任务
    set_task(state, checkpoint) {
        checkpoint.status = 1; // 关卡已被选择

        // 初始化任务数据
        state.task.cid = checkpoint.id;
        state.task.qid = null;

        // 保存当前关卡信息
        state.checkpoint = checkpoint;
        state.question = null;
        state.question_list = null;

        // 保存任务状态
        this.commit('set_task_status', G.FIND_CHECKPOINT);
    },

    // 设置当前题目
    set_question(state, question) {
        if (question.type > 0) {
            // 指定一道题目
            state.question_list = [question];
        } else {
            // 设置题库
            this.commit('set_question_list', question.child);
        }

        // 如果没有题目编号（初始状态），则随机从题库中抽取一题
        if (state.task.qid == null) {
            this.commit('set_random_question');
        }
        if (state.task.qid == null) {
            return;
        }

        // 更新题目数据
        question = state.game_config.question_list[state.task.qid];
        if (question == null) {
            // 由于后台修改了数据，可能出现没有检索到题目的情况，重新从题库提取一题
            this.commit('set_random_question');
        } else {
            state.question = question;
        }

        if ((question.type == 5) || (question.type == 9)) {
            // if (question.type == 5) {
            // 如果是道具，直接获取
            this.commit('answer_question', question.answer);
            this.commit('set_task_status', G.ANSWER_COMPLETE); // ANSWER_COMPLETE
        } else {
            // 需要回答问题
            this.commit('set_task_status', G.ANSWER_QUESTION); // ANSWER_QUESTION
        }
    },

    // 随机选择题目
    set_random_question(state) {
        var length = state.question_list.length;
        if (length > 0) {
            // 随机一个index
            var index = Math.floor(Math.random() * length);
            // 更新当前题目ID
            state.task.qid = state.question_list[index].id;
            // 更新题目数据
            state.question = state.game_config.question_list[state.task.qid];
        } else {
            state.task.qid = null;
            state.question = null;
        }
    },

    // 可以使用的题目
    set_question_list(state, question_list) {
        // console.log('set_question_list', question_list);
        state.question_list = [];
        var question;

        for (var key in question_list) {
            question = question_list[key];

            // 检查答题记录中是否已经使用了该题目
            //    To-do: 2018.1.25 暂时不需要判断
            // for (var key_record in state.record.list) {
            //     if (question.id == state.record.list[key_record].qid) {
            //         question = null;
            //         break;
            //     }
            // }

            if (question) {
                // 添加到待选的题库列表
                state.question_list.push(question);
            }
        }
    },

    // 回答问题
    answer_question(state, answer) {
        // console.log('answer_question', answer);
        var question = state.question;
        var mark = 0;
        var success = false;

        // 判断问题是否回答正确
        if ((question.type == 3) || (question.type == 5) || (question.type == 9)) {
            // 照片/道具/任务书，直接标记成功
            mark = parseInt(question.mark);
            success = true;
        } else if (answer == question.answer) {
            mark = parseInt(question.mark);
            success = true;
        }
        state.task.answer = answer;
        state.task.success = success;

        // 记录成绩
        var record = {
            cid: state.task.cid,
            qid: state.task.qid,
            mark: mark,
            success: success,
            answer: answer,
            time: Date.parse(new Date()) * 1000,
        };
        state.record.mark += mark;
        state.record.list.push(record);

        // 道具需要添加到tools列表
        if (question.type == 5) {
            state.record.tools.push(question.id);
        }

        // 保存状态
        var game_code = state.game_config.game_code;
        localStorage.setItem(game_code + '_record_list', JSON.stringify(state.record));
        this.commit('set_task_status', G.ANSWER_COMPLETE); // ANSWER_COMPLETE
    },

    // 远程保存记录
    set_record_remote(state) {
        let send_data = {
            type: 'log',
            user_id: state.userinfo.openid,
            game_id: state.userinfo.game_code,
            client: 'fengxun',
            client_type: 'game',
            target_id: 'ob',
            message: JSON.stringify(state.record)
        };

        let send_json = JSON.stringify(send_data);
        // console.log('set_record_remote', send_json);
        state.ws.send(send_json);
    },

    // 检查关卡完成
    check_checkpoint(state) {
        // 检查关卡的完成条件
        var question = state.question;
        var next_qid = state.task.success ? question.true_id : question.false_id;
        let next_question = state.game_config.question_list[next_qid];
        if ((next_qid == 0) || (next_question == null)) {
            // 关卡完成
            state.checkpoint.status = 2;
            this.commit('init_task');

            // 提交远程保存数据
            this.commit('set_record_remote');
            return;
        }

        // 设置下一步的题目
        state.task.qid = null;
        state.task.success = false;
        state.task.answer = '';
        this.commit('set_question', state.game_config.question_list[next_qid]);
        if (state.task.qid == null) {
            // 关卡完成
            state.checkpoint.status = 2;
            this.commit('init_task');

            // 提交远程保存数据
            this.commit('set_record_remote');
            return;
        }

        // 没有达到关卡完成条件，检查是否有下一题设置
        //   如果有，从下一题设置中获取
        //   如果没有，从关卡的题目设置中获取
        //   如果都没有，任务失败



        // 问题回答完毕完成（得分可能为0，可能>0）,保存状态

        // 标记关卡完成
        // this.commit('init_task', 2);

        // state.checkpoint.status = 2;

    },

    // 多人摇一摇计数
    set_multi_shake(state) {
        state.task.multi_shake_count++;
    }
};