import index from "./views/index.vue";
import wellcome from "./views/wellcome.vue";
import setting from "./views/setting.vue";
import tasklist from "./views/tasklist.vue";    // 任务列表
import taskinfo from "./views/taskinfo.vue";    // 任务详细信息（Checkpoint）
import task from "./views/task.vue";            // 当前任务（题目）
import question from "./views/question.vue";    // 题目
import complete from "./views/complete.vue";        // 回答完毕
import map from "./views/map.vue";
import rank from "./views/rank.vue";
import areamap from "./views/areamap.vue";

const routers = [
    {
        path: '/',
        name: '/',
        component: wellcome
    },
    {
        path: '/wellcome',
        name: 'wellcome',
        meta: {
            requireAuth: false,  // 添加该字段，表示进入这个路由是不需要登录的
        },
        component: wellcome
    },
    {
        path: '/index',
        name: 'index',
        component: index
    },
    {
        path: '/setting',
        name: 'setting',
        component: setting
    },
    {
        path: '/taskinfo/:id',
        name: 'taskinfo',
        component: taskinfo
    },
    {
        path: '/task',
        name: 'task',
        component: task
    },
    {
        path: '/question',
        name: 'question',
        component: question
    },
    {
        path: '/complete',
        name: 'complete',
        component: complete
    },
    {
        path: '/tasklist',
        name:'tasklist',
        component: tasklist
    },
    {
        path: '/map',
        name: 'map',
        component: map
    },
    {
        path: '/rank',
        name: 'rank',
        component: rank
    },
    {
        path:'/areamap',
        name:'areamap',
        component: areamap
    }
];

export default routers;