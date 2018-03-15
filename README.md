# vue-admin [Live Demo](http://vueadmin.hinplay.com/)

### 安装

***
项目地址: (`git clone`)
```shell
git clone https://github.com/croal99/run-admin.git
```
通过`npm`安装本地服务第三方依赖模块(需要已安装[Node.js](https://nodejs.org/))

```
npm install
```
启动服务: (http://localhost:3000)

```
npm run dev
```
发布代码

```
npm run build
```
***
### 目录结构
<pre>
├── build                            // 项目的 Webpack 配置文件
├── config                           // 项目配置目录
│   ├── index.js                     // 本地配置文件，采用proxyTable解决跨域
├── src                              // 生产目录
│   ├── api                          // *与后端进行通信的接口定义
│   │   ├── index.js                 // 接口定义（统一加载）
│   │   ├── game_config.js           // 游戏配置接口
│   │   ├── media.js                 // 媒体文件管理接口
│   ├── assets                       // 一些资源文件
│   ├── common                       // 通用文件、如工具类、状态码
│   │   ├── config                   // 通信配置
│   │   │   ├── index.js             // server_base_url，解决跨域的统一配置
│   │   ├── fetch                    // HTTP通信对象（axios）
│   │   ├── port_uri                 // 后端uri
│   │   │   ├── index.js             // 接口uri（统一加载）
│   │   │   ├── game_config.js       // 游戏配置接口uri
│   │   │   ├── media.js             // 媒体文件管理接口uri
│   │   ├── storage                  // 本地存储接口
│   │   ├── tools                    // 一些转换工具
│   ├── components                   // 各种组件
│   │   ├── leftSlide                // 左边导航
│   │   ├── mainContent              // 中间数据
│   ├── mock                         // mock（暂时不需要）
│   ├── pages                        // 各种页面
│   │   ├── checkpoint               // 关卡管理
│   │   │   ├── list.vue             // 关卡列表
│   │   │   ├── process.vue          // 关卡中的任务分配情况
│   │   │   ├── edit.vue             // 关卡信息编辑
│   │   ├── question                 // 题库管理
│   │   │   ├── list.vue             // 题库列表
│   │   │   ├── edit.vue             // 题库信息编辑
│   │   ├── media                    // 多媒體管理
│   │   │   ├── picture              // 圖片
│   │   │   │   ├── list.vue         // 圖片管理
│   │   │   │   ├── edit.vue         // 圖片管理
│   ├── plugins                      // 各种插件
│   ├── router                       // 路由配置及map
│   ├── store                        // Vuex 状态管理器
│   │   ├── mutations                // mutations
│   │   ├── states                   // states
│   ├── App.vue                      // 根组件
│   ├── favicon.ico                  // ico小图标
│   ├── index.html                   // 项目入口文件
│   ├── main.js                      // Webpack 编译入口文件，入口js
├── static                           // 静态资源，一般把不需要处理的文件可以放这里
│   ├── echarts-all.js               // echarts 2.0 (因为3.0无法显示多层Tree)
├── .babelrc                         // babelrc配置文件
├── .editorconfig                    // 代码风格文件，前提是要你的编辑器支持
├── .gitignore                       // 用于Git配置不需要加入版本管理的文件
├── .postcssrc.js                    // autoprefixer的配置文件
├── package.json                     // 项目配置文件
</pre>

# 关卡（Checkpoint）
|名称| 类型 | 说明
|---|---|---|
|id|int|编号|
|status|int|关卡状态 <br> 0--未开启 <br> 1--选中目标 <br> 2--到达位置 <br> 3--完成（成功） 4--完成（失败）|
|show|bool|是否显示（晋级书控制该字段）|
|code|char|编码（用于扫一扫，需要保证不重复）|
|memo|char|说明（内部使用）|
|name|char|名称（用于任务列表页面显示）|
|content|char|关卡内容（HTML，进入线索显示页面后渲染）|
|lng|char|经度|
|lat|char|纬度|
|range|int|误差范围（0-使用系统配置  >0单独配置）|
|method|int|触发方法 <br> 0--摇一摇 <br> 1--扫一扫|
|image0|char|状态图|
|image1|char|状态图|
|image2|char|状态图|
|image3|char|状态图|
|image4|char|状态图|
|css|char|css属性|
|question|int|题目编号|

# 题目（Question）
|名称| 类型 | 说明
|---|---|---|
|id|int|编号|
|type|int|题目类型，详细说明见下表|
|code|char|编码（不重复）|
|name|char|名称|
|content|char|说明（HTML）|
|items|char|详细说明见下表|
|answer|char|详细说明见下表|
|mark|char|详细说明见下表|
|true_id|int|回答正确后跳转题目编号（0--无跳转）|
|false_id|int|回答错误后跳转题目编号（0--无跳转）|
|child|array|下级题目（如果有下级题目，才会出现该字段。用于内部流程）|

# type定义
|编号| 类型 | name| content| items|answer|mark|说明|
|---|---|---|---|---|---|---|---|
|0 | 分类/题库 | 名称 | 说明||数量（默认1）||不显示
|3 | 上传照片 | 名称 | 说明||| 得分|
|5 | 普通道具 | 名称 | 说明/图片||道具编码|数量|不显示
|6 | 单选/多选题 | 名称 | 说明| 选项（&lt;br&gt;分割）| 答案（,分割） |得分
|7 | 多人摇一摇| 名称 | 说明| | 通关计数 |得分
|9 | 任务书| 名称 | HTML |||得分
|11 | 填空题 | 名称 | 说明|| 答案|得分
|12 | 晋级书 | 名称|说明|关卡列表（,分割）

![image](https://raw.githubusercontent.com/zzmhot/vue-admin/images/images_1.jpg)

