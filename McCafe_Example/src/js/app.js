var McRouter = require('../../../McCafe/McCafe_Router');

var component1 = require('./component_1');
var component2 = require('./component_2');

// 创建路由
McRouter.createRouter([
  {path: '/', component: component1},
  {path: '/index', component: component1},
  {path: '/component2', component: component2},
], '#app')

McRouter.goToHash();
