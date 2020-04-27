### 安装

***
项目地址: (`git clone`)
```shell
git clone https://github.com/croal99/run.git
```
通过`npm`安装本地服务第三方依赖模块(需要已安装[Node.js](https://nodejs.org/))

```
npm install --registry=https://registry.npm.taobao.org
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
│   │   ├── user.js                  // 用户管理接口
│   ├── assets                       // 一些资源文件
│   ├── common                       // 通用文件、如工具类、状态码
│   │   ├── config                   // 通信配置
│   │   │   ├── index.js             // server_base_url，解决跨域的统一配置
│   │   ├── fetch                    // HTTP通信对象（axios）
│   │   ├── port_uri                 // 后端uri
│   │   │   ├── index.js             // 接口uri（统一加载）
│   │   │   ├── game_config.js       // 游戏配置接口uri
│   │   │   ├── user.js              // 用户管理接口uri
│   │   ├── storage                  // 本地存储接口
│   │   ├── tools                    // 一些转换工具
│   ├── components                   // 各种组件
│   ├── mock                         // mock（暂时不需要）
│   ├── pages                        // 各种页面
│   │   ├── checkpoint               // 关卡
│   │   │   ├── list.vue             // 关卡列表tasklist
│   │   │   ├── show.vue             // 关卡任务情况task_show
│   │   │   ├── images               // 图片（摇一摇）
│   │   ├── question                 // 题目
│   │   │   ├── show.vue             // 题目显示question_show
│   │   ├── user                     // 用户
│   │   │   ├── images               // 圖片
│   │   │   ├── login.vue            // 用户登录welcome
│   │   │   ├── rank.vue             // 用户排行榜页面
│   │   │   ├── setting.vue          // 用户设置setting（基本信息，重玩）
│   │   │   ├── tools.vue            // 用户道具&成绩等等tools
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
├── .babelrc                         // babelrc配置文件
├── .editorconfig                    // 代码风格文件，前提是要你的编辑器支持
├── .gitignore                       // 用于Git配置不需要加入版本管理的文件
├── .postcssrc.js                    // autoprefixer的配置文件
├── package.json                     // 项目配置文件
</pre>
