# McCafe
Web路由、状态管理、模版框架

路由：McCafe_Router.js

路由格式：#/index/:param

方法：

  createRouter: 创建路由
  
    McCafeRouter.createRouter([
      {'path': '/index'},
      {'path': '/list'},
      {'path': '/detail/:index'},
    ])
  goTo: 路由跳转
  getRouter: 获取当前路由
  getParams: 获取路由参数

状态管理：McCafe_State.js

模版：McCafe_Tmpl.js
