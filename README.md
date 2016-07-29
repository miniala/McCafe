# McCafe
Web路由、状态管理、模版框架

##  路由：McCafe_Router.js

路由格式：#/index/:param

使用：
  
    var McCafeRouter = require('./McMcCafe_Router.js');
  
方法：

###  createRouter: 创建路由
  
    McCafeRouter.createRouter([
      {path: '/', component: indexComponent},
      {'path': '/list', component: listComponent},
      {'path': '/detail/:index', component: detailComponent},
    ])
    
###  goTo: 路由跳转
  
    McCafeRouter.goTo('/detail/1');
  
###  getPath: 获取当前路径
  
    McCafeRouter.getRouter();
  
###  getParam: 获取路由参数
  
    McCafeRouter.getParam('index');

##  状态管理：McCafe_State.js

使用：
  
    var McCafeState = require('./McCafe_State.js');
    var insMcCafeState = new McCafeState({
      key: {
        val: 0,
        callback: [callback]
      },
    });
  
方法：
  
### setState: 设置状态

    insState.setState({
      key: 'val'
    });
  
### getState: 获取状态
  
    insState.getState('key');

##  模版：McCafe_Tmpl.js

使用：
  
    var McCafeTmpl = require('./McCafe_Tmpl.js');

方法：
  
### tmpl: 编译模版
  
    var html = McCafeTmpl.tmpl('<div><%=name%></div>', {name: 'Memo'});

### render: 渲染模版
  
    McCafeTmpl.render('.container', '<div><%=name%></div>', {name: 'Memo'});
