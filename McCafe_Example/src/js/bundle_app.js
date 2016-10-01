(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * @github https://github.com/miniala/McCafe
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.McComponent = global.McComponent || {})));
}(this, (function (exports) { 'use strict';

  var McState = require('./McCafe_State');
  /*
   * @Class Component
   */
  function Component() {}

  // 使用McState原型方法
  Component.prototype = McState.prototype;

  /*
   * @prototype innerDidMount 安装完成
   */
  Component.prototype.innerDidMount = function() {
    this.didMount && this.didMount();
  }
  /*
   * @prototype innerDidUnMount 卸载完成
   */
  Component.prototype.innerDidUnMount = function() {
    this.didUnMount && this.didUnMount();
  }
  /*
   * @prototype mount 安装
   * @param selector target
   */
  Component.prototype.mount = function(target) {
    var _data = {};
    for(var k in this.state) {
      _data[k] = this.getState(k);
    }
    this.target = document.querySelector(target);
    this.target.innerHTML = this.tpl(_data);
    this.innerDidMount();
  }
  /*
   * @prototype unMount 卸载
   */
  Component.prototype.unMount = function() {
    this.innerDidUnMount();
    this.target.innerHTML = '';
  }
  /*
   * @prototype update 更新
   * @param Object data
   */
  Component.prototype.update = function(data) {
    this.setState(data);
  }

  /*
   * @prototype createClass 创建组件
   */
  var createComponent = function(obj) {
    var component = new Component();
    component.state = obj.state() || {};
    component.tpl = obj.tpl || function(){};
    for(var k in obj) {
      if(typeof obj[k] === 'function' && k != 'state' && k != 'tpl') {
        component[k] = obj[k];
      }
    }

    return component;
  }

  module.exports = {
    createComponent: createComponent
  }

})));
},{"./McCafe_State":3}],2:[function(require,module,exports){
/*
 * @github https://github.com/miniala/McCafe
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.McRouter = global.McRouter || {})));
}(this, (function (exports) { 'use strict';

	/*
	 * @Class McRouter
	 * @des 前端路由 格式：#/index/:param
	 */
	var McRouter = (function () {
		var routerState = {
			routers  : [],     // [{'path': '/index', 'params': ['a', 'b'], 'component': Function}]
			path     : '/',    // 当前路径
			params   : {},     // 当前参数
			component: null,   // 当前组件
			history  : [],     // 路由历史
			target   : 'body', // 组建渲染节点
		}

		/*
		 * @params routers Array 
		 * @params target String 
		 * @des 创建路由 [{'path': '/index/:param', 'component': Function}]
		 */
		function createRouter (routers, target) {
			for (var i=0, l=routers.length; i<l; i++) {
				var _router = {}; // 临时路径保存
				var _params = []; // 临时参数保存
				var _routersItem = routers[i];
				// 路径参数处理
				if(_routersItem.hasOwnProperty('path')) {
					_params = _routersItem.path.split('/:');
					_router.path = _params[0];
					_router.params = _params.splice(1);
				}
				// 回调组件
				if (_routersItem.hasOwnProperty('component')) {
					_router.component = _routersItem.component;
				}
				routerState.routers.push(_router);
				routerState.target = target || 'body';
			}
		}

		/*
		 * @param router String 
		 * @des 设置当前路由、参数
		 */
		function setRouter (router) {
			var _router = router || '/';
			var _routers = routerState.routers;
			// 重置默认路径
			routerState.path = '/'; 
			for(var i=0,l=_routers.length; i<l; i++) {
				var _routersItem = _routers[i];
				var _path = _routersItem.path;
				var _params = _routersItem.params;
				var _component = _routersItem.component;
				// 匹配路径正则
				var _reg = '^' + _path;
				for (var j=0, ll=_params.length; j<ll; j++) {
					_reg += '/.{1,}';
				}
				_reg += '$';
				// 是否匹配当前路由
				if ((new RegExp(_reg)).test(_router)) {
					// 设置 path
					routerState.path = _path;
					routerState.component = _component;
					// 设置 params
					var _hashPrams = _router.split(_path)[1].split('/');
					for (var k=0, lll=_routersItem.params.length; k<lll; k++) {
						routerState.params[_routersItem.params[k]] = _hashPrams[k+1];
					}
					break;
				}
			}
		}

		/*
		 * @param router String '/index/:param'
		 * @des 跳转
		 */
		function goTo (router) {
			var _router = router || '/';
			// 卸载组件
			routerState.component && routerState.component.unMount && routerState.component.unMount();
			// 设置路由
			setRouter (_router);
			routerState.routers.forEach(function (item, index) {
				// 安装组件
				if (routerState.path == item.path && item.component && typeof item.component == 'function') {
					item.component();
				} else if(routerState.path == item.path && typeof item.component.mount == 'function') {
					item.component.mount(routerState.target);
				}
			})
			// 存储历史记录
			routerState.history.push(router);
		}

		/*
		 * @des hash跳转
		 */
		function goToHash () {
			window.addEventListener('hashchange', function () {
				goTo(location.hash.replace('#', ''));
			})
			goTo(location.hash.replace('#', ''));
		}

		/*
		 * @des 跳转上一个路由
		 */
		function goPre () {
			goTo (routerState.history[routerState.history.length - 1] || '/')
		}

		/*
		 * @des 返回当前路由
		 */
		function getPath () {
			return routerState.path;
		}

		/*
		 * @des 返回当前路由参数
		 */
		function getParams () {
			return routerState.params;
		}

		/*
		 * @param param String
		 * @des 返回指定路由参数值
		 */
		function getParam (param) {
			return routerState.params[param];
		}

		/*
		 * @des Functions
		 */
		return {
			createRouter: createRouter,
			setRouter   : setRouter,
			getPath     : getPath,
			getParams   : getParams,
			getParam    : getParam,
			goTo        : goTo,
			goPre       : goPre,
			goToHash    : goToHash,
		}
	})()

	module.exports = McRouter;

})));
},{}],3:[function(require,module,exports){
/*
 * @github https://github.com/miniala/McCafe
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.McState = global.McState || {})));
}(this, (function (exports) { 'use strict';

  /*
   * @Name McCafeState
   * @param Object obj eg: {, state : {val: value, callback: [,function]}}
   */ 
  var McState = function (obj) {
    this.state = obj;
  }
  /*
   * @Function setState
   * @param Object obj
   */
  McState.prototype.setState = function (obj) {
    var that = this;
    var callBackCache = [];
    for (var k in obj) {
      that.state[k].val = obj[k];
      if (that.state[k].hasOwnProperty('callback')) {
        that.state[k].callback.forEach(function (item, index) {
          var had = 0;
          callBackCache.forEach(function (cacheItem, cacheIndex) {
            if(cacheItem === item) had = 1;
          });
          // 缓存，避免重复回调
          if(had == 0) callBackCache.push(item);
        })
      }
    }
    callBackCache.forEach(function (cacheItem, cacheIndex) {
      if(typeof cacheItem === 'function') {
        cacheItem();
      } else if(typeof cacheItem === 'string') {
        that[cacheItem]();
      }
    })
    callBackCache = null;
  }
  /*
   * @Function getState
   * @param String state
   */
  McState.prototype.getState = function (state) {
    return this.state[state].val;
  }
  /*
   * @Function bind
   * @param String key
   * @param Function callback
   */
  McState.prototype.bind = function (key, callback) {
    var that = this;
    if (!that.state.hasOwnProperty(key)) return;
    if (!that.state[key].callback) {
      that.state[key].callback = []
    }
    that.state[key].callback.push(callback);
  }

  module.exports = McState;

})));
},{}],4:[function(require,module,exports){
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

},{"../../../McCafe/McCafe_Router":2,"./component_1":5,"./component_2":6}],5:[function(require,module,exports){
var McRouter = require('../../../McCafe/McCafe_Router');
var McComponent = require('../../../McCafe/McCafe_Component');

var tpl = require('../tpl/component_1');

var childComponent = require('./component_child');

var component = McComponent.createComponent({
  tpl: tpl,
  state: function(){
    return {
      name: {
        val: 'Momo'
      },
      number: {
        val: '1',
        callback: ['changeInput1']
      }
    }
  },
  didMount: function() {
    $(this.target).on('click', '#btn', function() {
      alert('click button');
    })
    $(this.target).on('click', '#btn-to-component2', function() {
      McRouter.goTo('/component2');
    })
    $(this.target).on('click', '#btn-to-hash', function() {
      location.hash = '/component2';
    })
    childComponent.mount('#child-component');
  },
  didUnMount: function() {
    $(this.target).off();
    childComponent.unMount();
  },
  changeInput1: function() {
    $(this.target).find('#number').val(this.getState('number'));
  },
  upateNumber: function(number) {
    this.setState({
      number: number
    })
  },
});

module.exports = component;
},{"../../../McCafe/McCafe_Component":1,"../../../McCafe/McCafe_Router":2,"../tpl/component_1":9,"./component_child":7}],6:[function(require,module,exports){
var McComponent = require('../../../McCafe/McCafe_Component');

var tpl = require('../tpl/component_2');

var component = McComponent.createComponent({
  tpl: tpl,
  state: function(){
    return {
      height: {
        val: '172'
      },
      weight: {
        val: '0',
        callback: ['changeInput']
      }
    }
  },
  didMount: function() {
    $(this.target).on('click', '#btn-2', function() {
      alert('click button 2');
    })
    $(this.target).on('click', '#btn-to-index', function() {
      location.hash = '/';
    })
  },
  didUnMount: function() {
    $(this.target).off();
  },
  changeInput: function() {
    $(this.target).find('#weight').val(this.getState('weight'));
  }
});

module.exports = component;

},{"../../../McCafe/McCafe_Component":1,"../tpl/component_2":10}],7:[function(require,module,exports){
var McComponent = require('../../../McCafe/McCafe_Component');

var tpl = require('../tpl/child_component');

var component = McComponent.createComponent({
  tpl: tpl,
  state: function(){
    return {
      child: {
        val: 'Momo'
      }
    }
  },
  didMount: function() {
    $(this.target).on('click', '#btn-child', function() {
      alert('click child button');
      appState.setNumber('3');
    })
  },
  didUnMount: function() {
    $(this.target).off();
  },
});

module.exports = component;

},{"../../../McCafe/McCafe_Component":1,"../tpl/child_component":8}],8:[function(require,module,exports){
(function (name, definition) {if (typeof exports !== 'undefined' && typeof module !== 'undefined') {module.exports = definition();} else if (typeof define === 'function' && typeof define.amd === 'object') {define(definition);} else if (typeof define === 'function' && typeof define.petal === 'object') {define(name, [], definition);} else {this[name] = definition();}})('tmpl', function (tmpl) {return function anonymous(obj
/**/) {
var p=[];with(obj){p.push('<h2>Child Component</h2><ul>  <li><input type="text" value="', child,'" id="child" /></li>  <li><button id="btn-child">Child Button</Button></li></ul>');} return p.join('');
}})
},{}],9:[function(require,module,exports){
(function (name, definition) {if (typeof exports !== 'undefined' && typeof module !== 'undefined') {module.exports = definition();} else if (typeof define === 'function' && typeof define.amd === 'object') {define(definition);} else if (typeof define === 'function' && typeof define.petal === 'object') {define(name, [], definition);} else {this[name] = definition();}})('tmpl', function (tmpl) {return function anonymous(obj
/**/) {
var p=[];with(obj){p.push('<h1>Component-1</h1><ul>  <li><input type="text" value="', name,'" id="name" /></li>  <li><input type="text" value="', number,'" id="number" /></li>  <li><button id="btn">BUTTON</Button></li>  <li><button id="btn-to-component2">Go To Component 2</Button></li>  <li><button id="btn-to-hash">Go To hash</Button></li></ul><div id="child-component"></div>');} return p.join('');
}})
},{}],10:[function(require,module,exports){
(function (name, definition) {if (typeof exports !== 'undefined' && typeof module !== 'undefined') {module.exports = definition();} else if (typeof define === 'function' && typeof define.amd === 'object') {define(definition);} else if (typeof define === 'function' && typeof define.petal === 'object') {define(name, [], definition);} else {this[name] = definition();}})('tmpl', function (tmpl) {return function anonymous(obj
/**/) {
var p=[];with(obj){p.push('<h1>Component-2</h1><ul>  <li><input type="text" value="', height,'" id="height" /></li>  <li><input type="text" value="', weight,'" id="weight" /></li>  <li><button id="btn-2">BUTTON 2</Button></li>  <li><button id="btn-to-index">Go To Index</Button></li></ul>');} return p.join('');
}})
},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY29tcG9uZW50L01jQ2FmZS9NY0NhZmVfQ29tcG9uZW50LmpzIiwicHVibGljL2NvbXBvbmVudC9NY0NhZmUvTWNDYWZlX1JvdXRlci5qcyIsInB1YmxpYy9jb21wb25lbnQvTWNDYWZlL01jQ2FmZV9TdGF0ZS5qcyIsInB1YmxpYy9jb21wb25lbnQvTWNDYWZlX0V4YW1wbGUvc3JjL2pzL2FwcC5qcyIsInB1YmxpYy9jb21wb25lbnQvTWNDYWZlX0V4YW1wbGUvc3JjL2pzL2NvbXBvbmVudF8xLmpzIiwicHVibGljL2NvbXBvbmVudC9NY0NhZmVfRXhhbXBsZS9zcmMvanMvY29tcG9uZW50XzIuanMiLCJwdWJsaWMvY29tcG9uZW50L01jQ2FmZV9FeGFtcGxlL3NyYy9qcy9jb21wb25lbnRfY2hpbGQuanMiLCJwdWJsaWMvY29tcG9uZW50L01jQ2FmZV9FeGFtcGxlL3NyYy90cGwvY2hpbGRfY29tcG9uZW50LmpzIiwicHVibGljL2NvbXBvbmVudC9NY0NhZmVfRXhhbXBsZS9zcmMvdHBsL2NvbXBvbmVudF8xLmpzIiwicHVibGljL2NvbXBvbmVudC9NY0NhZmVfRXhhbXBsZS9zcmMvdHBsL2NvbXBvbmVudF8yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbiAqIEBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL21pbmlhbGEvTWNDYWZlXHJcbiAqL1xyXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xyXG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxyXG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxyXG4gIChmYWN0b3J5KChnbG9iYWwuTWNDb21wb25lbnQgPSBnbG9iYWwuTWNDb21wb25lbnQgfHwge30pKSk7XHJcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIE1jU3RhdGUgPSByZXF1aXJlKCcuL01jQ2FmZV9TdGF0ZScpO1xyXG4gIC8qXHJcbiAgICogQENsYXNzIENvbXBvbmVudFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIENvbXBvbmVudCgpIHt9XHJcblxyXG4gIC8vIOS9v+eUqE1jU3RhdGXljp/lnovmlrnms5VcclxuICBDb21wb25lbnQucHJvdG90eXBlID0gTWNTdGF0ZS5wcm90b3R5cGU7XHJcblxyXG4gIC8qXHJcbiAgICogQHByb3RvdHlwZSBpbm5lckRpZE1vdW50IOWuieijheWujOaIkFxyXG4gICAqL1xyXG4gIENvbXBvbmVudC5wcm90b3R5cGUuaW5uZXJEaWRNb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kaWRNb3VudCAmJiB0aGlzLmRpZE1vdW50KCk7XHJcbiAgfVxyXG4gIC8qXHJcbiAgICogQHByb3RvdHlwZSBpbm5lckRpZFVuTW91bnQg5Y246L295a6M5oiQXHJcbiAgICovXHJcbiAgQ29tcG9uZW50LnByb3RvdHlwZS5pbm5lckRpZFVuTW91bnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZGlkVW5Nb3VudCAmJiB0aGlzLmRpZFVuTW91bnQoKTtcclxuICB9XHJcbiAgLypcclxuICAgKiBAcHJvdG90eXBlIG1vdW50IOWuieijhVxyXG4gICAqIEBwYXJhbSBzZWxlY3RvciB0YXJnZXRcclxuICAgKi9cclxuICBDb21wb25lbnQucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICB2YXIgX2RhdGEgPSB7fTtcclxuICAgIGZvcih2YXIgayBpbiB0aGlzLnN0YXRlKSB7XHJcbiAgICAgIF9kYXRhW2tdID0gdGhpcy5nZXRTdGF0ZShrKTtcclxuICAgIH1cclxuICAgIHRoaXMudGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xyXG4gICAgdGhpcy50YXJnZXQuaW5uZXJIVE1MID0gdGhpcy50cGwoX2RhdGEpO1xyXG4gICAgdGhpcy5pbm5lckRpZE1vdW50KCk7XHJcbiAgfVxyXG4gIC8qXHJcbiAgICogQHByb3RvdHlwZSB1bk1vdW50IOWNuOi9vVxyXG4gICAqL1xyXG4gIENvbXBvbmVudC5wcm90b3R5cGUudW5Nb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pbm5lckRpZFVuTW91bnQoKTtcclxuICAgIHRoaXMudGFyZ2V0LmlubmVySFRNTCA9ICcnO1xyXG4gIH1cclxuICAvKlxyXG4gICAqIEBwcm90b3R5cGUgdXBkYXRlIOabtOaWsFxyXG4gICAqIEBwYXJhbSBPYmplY3QgZGF0YVxyXG4gICAqL1xyXG4gIENvbXBvbmVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZShkYXRhKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQHByb3RvdHlwZSBjcmVhdGVDbGFzcyDliJvlu7rnu4Tku7ZcclxuICAgKi9cclxuICB2YXIgY3JlYXRlQ29tcG9uZW50ID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICB2YXIgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudCgpO1xyXG4gICAgY29tcG9uZW50LnN0YXRlID0gb2JqLnN0YXRlKCkgfHwge307XHJcbiAgICBjb21wb25lbnQudHBsID0gb2JqLnRwbCB8fCBmdW5jdGlvbigpe307XHJcbiAgICBmb3IodmFyIGsgaW4gb2JqKSB7XHJcbiAgICAgIGlmKHR5cGVvZiBvYmpba10gPT09ICdmdW5jdGlvbicgJiYgayAhPSAnc3RhdGUnICYmIGsgIT0gJ3RwbCcpIHtcclxuICAgICAgICBjb21wb25lbnRba10gPSBvYmpba107XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29tcG9uZW50O1xyXG4gIH1cclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBjcmVhdGVDb21wb25lbnQ6IGNyZWF0ZUNvbXBvbmVudFxyXG4gIH1cclxuXHJcbn0pKSk7IiwiLypcbiAqIEBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL21pbmlhbGEvTWNDYWZlXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5NY1JvdXRlciA9IGdsb2JhbC5NY1JvdXRlciB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuXHQvKlxuXHQgKiBAQ2xhc3MgTWNSb3V0ZXJcblx0ICogQGRlcyDliY3nq6/ot6/nlLEg5qC85byP77yaIy9pbmRleC86cGFyYW1cblx0ICovXG5cdHZhciBNY1JvdXRlciA9IChmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJvdXRlclN0YXRlID0ge1xuXHRcdFx0cm91dGVycyAgOiBbXSwgICAgIC8vIFt7J3BhdGgnOiAnL2luZGV4JywgJ3BhcmFtcyc6IFsnYScsICdiJ10sICdjb21wb25lbnQnOiBGdW5jdGlvbn1dXG5cdFx0XHRwYXRoICAgICA6ICcvJywgICAgLy8g5b2T5YmN6Lev5b6EXG5cdFx0XHRwYXJhbXMgICA6IHt9LCAgICAgLy8g5b2T5YmN5Y+C5pWwXG5cdFx0XHRjb21wb25lbnQ6IG51bGwsICAgLy8g5b2T5YmN57uE5Lu2XG5cdFx0XHRoaXN0b3J5ICA6IFtdLCAgICAgLy8g6Lev55Sx5Y6G5Y+yXG5cdFx0XHR0YXJnZXQgICA6ICdib2R5JywgLy8g57uE5bu65riy5p+T6IqC54K5XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiBAcGFyYW1zIHJvdXRlcnMgQXJyYXkgXG5cdFx0ICogQHBhcmFtcyB0YXJnZXQgU3RyaW5nIFxuXHRcdCAqIEBkZXMg5Yib5bu66Lev55SxIFt7J3BhdGgnOiAnL2luZGV4LzpwYXJhbScsICdjb21wb25lbnQnOiBGdW5jdGlvbn1dXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY3JlYXRlUm91dGVyIChyb3V0ZXJzLCB0YXJnZXQpIHtcblx0XHRcdGZvciAodmFyIGk9MCwgbD1yb3V0ZXJzLmxlbmd0aDsgaTxsOyBpKyspIHtcblx0XHRcdFx0dmFyIF9yb3V0ZXIgPSB7fTsgLy8g5Li05pe26Lev5b6E5L+d5a2YXG5cdFx0XHRcdHZhciBfcGFyYW1zID0gW107IC8vIOS4tOaXtuWPguaVsOS/neWtmFxuXHRcdFx0XHR2YXIgX3JvdXRlcnNJdGVtID0gcm91dGVyc1tpXTtcblx0XHRcdFx0Ly8g6Lev5b6E5Y+C5pWw5aSE55CGXG5cdFx0XHRcdGlmKF9yb3V0ZXJzSXRlbS5oYXNPd25Qcm9wZXJ0eSgncGF0aCcpKSB7XG5cdFx0XHRcdFx0X3BhcmFtcyA9IF9yb3V0ZXJzSXRlbS5wYXRoLnNwbGl0KCcvOicpO1xuXHRcdFx0XHRcdF9yb3V0ZXIucGF0aCA9IF9wYXJhbXNbMF07XG5cdFx0XHRcdFx0X3JvdXRlci5wYXJhbXMgPSBfcGFyYW1zLnNwbGljZSgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyDlm57osIPnu4Tku7Zcblx0XHRcdFx0aWYgKF9yb3V0ZXJzSXRlbS5oYXNPd25Qcm9wZXJ0eSgnY29tcG9uZW50JykpIHtcblx0XHRcdFx0XHRfcm91dGVyLmNvbXBvbmVudCA9IF9yb3V0ZXJzSXRlbS5jb21wb25lbnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0cm91dGVyU3RhdGUucm91dGVycy5wdXNoKF9yb3V0ZXIpO1xuXHRcdFx0XHRyb3V0ZXJTdGF0ZS50YXJnZXQgPSB0YXJnZXQgfHwgJ2JvZHknO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogQHBhcmFtIHJvdXRlciBTdHJpbmcgXG5cdFx0ICogQGRlcyDorr7nva7lvZPliY3ot6/nlLHjgIHlj4LmlbBcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzZXRSb3V0ZXIgKHJvdXRlcikge1xuXHRcdFx0dmFyIF9yb3V0ZXIgPSByb3V0ZXIgfHwgJy8nO1xuXHRcdFx0dmFyIF9yb3V0ZXJzID0gcm91dGVyU3RhdGUucm91dGVycztcblx0XHRcdC8vIOmHjee9rum7mOiupOi3r+W+hFxuXHRcdFx0cm91dGVyU3RhdGUucGF0aCA9ICcvJzsgXG5cdFx0XHRmb3IodmFyIGk9MCxsPV9yb3V0ZXJzLmxlbmd0aDsgaTxsOyBpKyspIHtcblx0XHRcdFx0dmFyIF9yb3V0ZXJzSXRlbSA9IF9yb3V0ZXJzW2ldO1xuXHRcdFx0XHR2YXIgX3BhdGggPSBfcm91dGVyc0l0ZW0ucGF0aDtcblx0XHRcdFx0dmFyIF9wYXJhbXMgPSBfcm91dGVyc0l0ZW0ucGFyYW1zO1xuXHRcdFx0XHR2YXIgX2NvbXBvbmVudCA9IF9yb3V0ZXJzSXRlbS5jb21wb25lbnQ7XG5cdFx0XHRcdC8vIOWMuemFjei3r+W+hOato+WImVxuXHRcdFx0XHR2YXIgX3JlZyA9ICdeJyArIF9wYXRoO1xuXHRcdFx0XHRmb3IgKHZhciBqPTAsIGxsPV9wYXJhbXMubGVuZ3RoOyBqPGxsOyBqKyspIHtcblx0XHRcdFx0XHRfcmVnICs9ICcvLnsxLH0nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdF9yZWcgKz0gJyQnO1xuXHRcdFx0XHQvLyDmmK/lkKbljLnphY3lvZPliY3ot6/nlLFcblx0XHRcdFx0aWYgKChuZXcgUmVnRXhwKF9yZWcpKS50ZXN0KF9yb3V0ZXIpKSB7XG5cdFx0XHRcdFx0Ly8g6K6+572uIHBhdGhcblx0XHRcdFx0XHRyb3V0ZXJTdGF0ZS5wYXRoID0gX3BhdGg7XG5cdFx0XHRcdFx0cm91dGVyU3RhdGUuY29tcG9uZW50ID0gX2NvbXBvbmVudDtcblx0XHRcdFx0XHQvLyDorr7nva4gcGFyYW1zXG5cdFx0XHRcdFx0dmFyIF9oYXNoUHJhbXMgPSBfcm91dGVyLnNwbGl0KF9wYXRoKVsxXS5zcGxpdCgnLycpO1xuXHRcdFx0XHRcdGZvciAodmFyIGs9MCwgbGxsPV9yb3V0ZXJzSXRlbS5wYXJhbXMubGVuZ3RoOyBrPGxsbDsgaysrKSB7XG5cdFx0XHRcdFx0XHRyb3V0ZXJTdGF0ZS5wYXJhbXNbX3JvdXRlcnNJdGVtLnBhcmFtc1trXV0gPSBfaGFzaFByYW1zW2srMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiBAcGFyYW0gcm91dGVyIFN0cmluZyAnL2luZGV4LzpwYXJhbSdcblx0XHQgKiBAZGVzIOi3s+i9rFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdvVG8gKHJvdXRlcikge1xuXHRcdFx0dmFyIF9yb3V0ZXIgPSByb3V0ZXIgfHwgJy8nO1xuXHRcdFx0Ly8g5Y246L2957uE5Lu2XG5cdFx0XHRyb3V0ZXJTdGF0ZS5jb21wb25lbnQgJiYgcm91dGVyU3RhdGUuY29tcG9uZW50LnVuTW91bnQgJiYgcm91dGVyU3RhdGUuY29tcG9uZW50LnVuTW91bnQoKTtcblx0XHRcdC8vIOiuvue9rui3r+eUsVxuXHRcdFx0c2V0Um91dGVyIChfcm91dGVyKTtcblx0XHRcdHJvdXRlclN0YXRlLnJvdXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcblx0XHRcdFx0Ly8g5a6J6KOF57uE5Lu2XG5cdFx0XHRcdGlmIChyb3V0ZXJTdGF0ZS5wYXRoID09IGl0ZW0ucGF0aCAmJiBpdGVtLmNvbXBvbmVudCAmJiB0eXBlb2YgaXRlbS5jb21wb25lbnQgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGl0ZW0uY29tcG9uZW50KCk7XG5cdFx0XHRcdH0gZWxzZSBpZihyb3V0ZXJTdGF0ZS5wYXRoID09IGl0ZW0ucGF0aCAmJiB0eXBlb2YgaXRlbS5jb21wb25lbnQubW91bnQgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGl0ZW0uY29tcG9uZW50Lm1vdW50KHJvdXRlclN0YXRlLnRhcmdldCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQvLyDlrZjlgqjljoblj7LorrDlvZVcblx0XHRcdHJvdXRlclN0YXRlLmhpc3RvcnkucHVzaChyb3V0ZXIpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogQGRlcyBoYXNo6Lez6L2sXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ29Ub0hhc2ggKCkge1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGdvVG8obG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpKTtcblx0XHRcdH0pXG5cdFx0XHRnb1RvKGxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKSk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiBAZGVzIOi3s+i9rOS4iuS4gOS4qui3r+eUsVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdvUHJlICgpIHtcblx0XHRcdGdvVG8gKHJvdXRlclN0YXRlLmhpc3Rvcnlbcm91dGVyU3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSB8fCAnLycpXG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiBAZGVzIOi/lOWbnuW9k+WJjei3r+eUsVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFBhdGggKCkge1xuXHRcdFx0cmV0dXJuIHJvdXRlclN0YXRlLnBhdGg7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiBAZGVzIOi/lOWbnuW9k+WJjei3r+eUseWPguaVsFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFBhcmFtcyAoKSB7XG5cdFx0XHRyZXR1cm4gcm91dGVyU3RhdGUucGFyYW1zO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogQHBhcmFtIHBhcmFtIFN0cmluZ1xuXHRcdCAqIEBkZXMg6L+U5Zue5oyH5a6a6Lev55Sx5Y+C5pWw5YC8XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UGFyYW0gKHBhcmFtKSB7XG5cdFx0XHRyZXR1cm4gcm91dGVyU3RhdGUucGFyYW1zW3BhcmFtXTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdCAqIEBkZXMgRnVuY3Rpb25zXG5cdFx0ICovXG5cdFx0cmV0dXJuIHtcblx0XHRcdGNyZWF0ZVJvdXRlcjogY3JlYXRlUm91dGVyLFxuXHRcdFx0c2V0Um91dGVyICAgOiBzZXRSb3V0ZXIsXG5cdFx0XHRnZXRQYXRoICAgICA6IGdldFBhdGgsXG5cdFx0XHRnZXRQYXJhbXMgICA6IGdldFBhcmFtcyxcblx0XHRcdGdldFBhcmFtICAgIDogZ2V0UGFyYW0sXG5cdFx0XHRnb1RvICAgICAgICA6IGdvVG8sXG5cdFx0XHRnb1ByZSAgICAgICA6IGdvUHJlLFxuXHRcdFx0Z29Ub0hhc2ggICAgOiBnb1RvSGFzaCxcblx0XHR9XG5cdH0pKClcblxuXHRtb2R1bGUuZXhwb3J0cyA9IE1jUm91dGVyO1xuXG59KSkpOyIsIi8qXHJcbiAqIEBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL21pbmlhbGEvTWNDYWZlXHJcbiAqL1xyXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xyXG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxyXG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxyXG4gIChmYWN0b3J5KChnbG9iYWwuTWNTdGF0ZSA9IGdsb2JhbC5NY1N0YXRlIHx8IHt9KSkpO1xyXG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8qXHJcbiAgICogQE5hbWUgTWNDYWZlU3RhdGVcclxuICAgKiBAcGFyYW0gT2JqZWN0IG9iaiBlZzogeywgc3RhdGUgOiB7dmFsOiB2YWx1ZSwgY2FsbGJhY2s6IFssZnVuY3Rpb25dfX1cclxuICAgKi8gXHJcbiAgdmFyIE1jU3RhdGUgPSBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICB0aGlzLnN0YXRlID0gb2JqO1xyXG4gIH1cclxuICAvKlxyXG4gICAqIEBGdW5jdGlvbiBzZXRTdGF0ZVxyXG4gICAqIEBwYXJhbSBPYmplY3Qgb2JqXHJcbiAgICovXHJcbiAgTWNTdGF0ZS5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgY2FsbEJhY2tDYWNoZSA9IFtdO1xyXG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcclxuICAgICAgdGhhdC5zdGF0ZVtrXS52YWwgPSBvYmpba107XHJcbiAgICAgIGlmICh0aGF0LnN0YXRlW2tdLmhhc093blByb3BlcnR5KCdjYWxsYmFjaycpKSB7XHJcbiAgICAgICAgdGhhdC5zdGF0ZVtrXS5jYWxsYmFjay5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgdmFyIGhhZCA9IDA7XHJcbiAgICAgICAgICBjYWxsQmFja0NhY2hlLmZvckVhY2goZnVuY3Rpb24gKGNhY2hlSXRlbSwgY2FjaGVJbmRleCkge1xyXG4gICAgICAgICAgICBpZihjYWNoZUl0ZW0gPT09IGl0ZW0pIGhhZCA9IDE7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIC8vIOe8k+WtmO+8jOmBv+WFjemHjeWkjeWbnuiwg1xyXG4gICAgICAgICAgaWYoaGFkID09IDApIGNhbGxCYWNrQ2FjaGUucHVzaChpdGVtKTtcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjYWxsQmFja0NhY2hlLmZvckVhY2goZnVuY3Rpb24gKGNhY2hlSXRlbSwgY2FjaGVJbmRleCkge1xyXG4gICAgICBpZih0eXBlb2YgY2FjaGVJdGVtID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY2FjaGVJdGVtKCk7XHJcbiAgICAgIH0gZWxzZSBpZih0eXBlb2YgY2FjaGVJdGVtID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHRoYXRbY2FjaGVJdGVtXSgpO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgY2FsbEJhY2tDYWNoZSA9IG51bGw7XHJcbiAgfVxyXG4gIC8qXHJcbiAgICogQEZ1bmN0aW9uIGdldFN0YXRlXHJcbiAgICogQHBhcmFtIFN0cmluZyBzdGF0ZVxyXG4gICAqL1xyXG4gIE1jU3RhdGUucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVtzdGF0ZV0udmFsO1xyXG4gIH1cclxuICAvKlxyXG4gICAqIEBGdW5jdGlvbiBiaW5kXHJcbiAgICogQHBhcmFtIFN0cmluZyBrZXlcclxuICAgKiBAcGFyYW0gRnVuY3Rpb24gY2FsbGJhY2tcclxuICAgKi9cclxuICBNY1N0YXRlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKGtleSwgY2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGlmICghdGhhdC5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSByZXR1cm47XHJcbiAgICBpZiAoIXRoYXQuc3RhdGVba2V5XS5jYWxsYmFjaykge1xyXG4gICAgICB0aGF0LnN0YXRlW2tleV0uY2FsbGJhY2sgPSBbXVxyXG4gICAgfVxyXG4gICAgdGhhdC5zdGF0ZVtrZXldLmNhbGxiYWNrLnB1c2goY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBNY1N0YXRlO1xyXG5cclxufSkpKTsiLCJ2YXIgTWNSb3V0ZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9NY0NhZmUvTWNDYWZlX1JvdXRlcicpO1xyXG5cclxudmFyIGNvbXBvbmVudDEgPSByZXF1aXJlKCcuL2NvbXBvbmVudF8xJyk7XHJcbnZhciBjb21wb25lbnQyID0gcmVxdWlyZSgnLi9jb21wb25lbnRfMicpO1xyXG5cclxuLy8g5Yib5bu66Lev55SxXHJcbk1jUm91dGVyLmNyZWF0ZVJvdXRlcihbXHJcbiAge3BhdGg6ICcvJywgY29tcG9uZW50OiBjb21wb25lbnQxfSxcclxuICB7cGF0aDogJy9pbmRleCcsIGNvbXBvbmVudDogY29tcG9uZW50MX0sXHJcbiAge3BhdGg6ICcvY29tcG9uZW50MicsIGNvbXBvbmVudDogY29tcG9uZW50Mn0sXHJcbl0sICcjYXBwJylcclxuXHJcbk1jUm91dGVyLmdvVG9IYXNoKCk7XHJcbiIsInZhciBNY1JvdXRlciA9IHJlcXVpcmUoJy4uLy4uLy4uL01jQ2FmZS9NY0NhZmVfUm91dGVyJyk7XHJcbnZhciBNY0NvbXBvbmVudCA9IHJlcXVpcmUoJy4uLy4uLy4uL01jQ2FmZS9NY0NhZmVfQ29tcG9uZW50Jyk7XHJcblxyXG52YXIgdHBsID0gcmVxdWlyZSgnLi4vdHBsL2NvbXBvbmVudF8xJyk7XHJcblxyXG52YXIgY2hpbGRDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudF9jaGlsZCcpO1xyXG5cclxudmFyIGNvbXBvbmVudCA9IE1jQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudCh7XHJcbiAgdHBsOiB0cGwsXHJcbiAgc3RhdGU6IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiB7XHJcbiAgICAgICAgdmFsOiAnTW9tbydcclxuICAgICAgfSxcclxuICAgICAgbnVtYmVyOiB7XHJcbiAgICAgICAgdmFsOiAnMScsXHJcbiAgICAgICAgY2FsbGJhY2s6IFsnY2hhbmdlSW5wdXQxJ11cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgZGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgJCh0aGlzLnRhcmdldCkub24oJ2NsaWNrJywgJyNidG4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgYWxlcnQoJ2NsaWNrIGJ1dHRvbicpO1xyXG4gICAgfSlcclxuICAgICQodGhpcy50YXJnZXQpLm9uKCdjbGljaycsICcjYnRuLXRvLWNvbXBvbmVudDInLCBmdW5jdGlvbigpIHtcclxuICAgICAgTWNSb3V0ZXIuZ29UbygnL2NvbXBvbmVudDInKTtcclxuICAgIH0pXHJcbiAgICAkKHRoaXMudGFyZ2V0KS5vbignY2xpY2snLCAnI2J0bi10by1oYXNoJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSAnL2NvbXBvbmVudDInO1xyXG4gICAgfSlcclxuICAgIGNoaWxkQ29tcG9uZW50Lm1vdW50KCcjY2hpbGQtY29tcG9uZW50Jyk7XHJcbiAgfSxcclxuICBkaWRVbk1vdW50OiBmdW5jdGlvbigpIHtcclxuICAgICQodGhpcy50YXJnZXQpLm9mZigpO1xyXG4gICAgY2hpbGRDb21wb25lbnQudW5Nb3VudCgpO1xyXG4gIH0sXHJcbiAgY2hhbmdlSW5wdXQxOiBmdW5jdGlvbigpIHtcclxuICAgICQodGhpcy50YXJnZXQpLmZpbmQoJyNudW1iZXInKS52YWwodGhpcy5nZXRTdGF0ZSgnbnVtYmVyJykpO1xyXG4gIH0sXHJcbiAgdXBhdGVOdW1iZXI6IGZ1bmN0aW9uKG51bWJlcikge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIG51bWJlcjogbnVtYmVyXHJcbiAgICB9KVxyXG4gIH0sXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjb21wb25lbnQ7IiwidmFyIE1jQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vLi4vLi4vTWNDYWZlL01jQ2FmZV9Db21wb25lbnQnKTtcclxuXHJcbnZhciB0cGwgPSByZXF1aXJlKCcuLi90cGwvY29tcG9uZW50XzInKTtcclxuXHJcbnZhciBjb21wb25lbnQgPSBNY0NvbXBvbmVudC5jcmVhdGVDb21wb25lbnQoe1xyXG4gIHRwbDogdHBsLFxyXG4gIHN0YXRlOiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaGVpZ2h0OiB7XHJcbiAgICAgICAgdmFsOiAnMTcyJ1xyXG4gICAgICB9LFxyXG4gICAgICB3ZWlnaHQ6IHtcclxuICAgICAgICB2YWw6ICcwJyxcclxuICAgICAgICBjYWxsYmFjazogWydjaGFuZ2VJbnB1dCddXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIGRpZE1vdW50OiBmdW5jdGlvbigpIHtcclxuICAgICQodGhpcy50YXJnZXQpLm9uKCdjbGljaycsICcjYnRuLTInLCBmdW5jdGlvbigpIHtcclxuICAgICAgYWxlcnQoJ2NsaWNrIGJ1dHRvbiAyJyk7XHJcbiAgICB9KVxyXG4gICAgJCh0aGlzLnRhcmdldCkub24oJ2NsaWNrJywgJyNidG4tdG8taW5kZXgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgbG9jYXRpb24uaGFzaCA9ICcvJztcclxuICAgIH0pXHJcbiAgfSxcclxuICBkaWRVbk1vdW50OiBmdW5jdGlvbigpIHtcclxuICAgICQodGhpcy50YXJnZXQpLm9mZigpO1xyXG4gIH0sXHJcbiAgY2hhbmdlSW5wdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgJCh0aGlzLnRhcmdldCkuZmluZCgnI3dlaWdodCcpLnZhbCh0aGlzLmdldFN0YXRlKCd3ZWlnaHQnKSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29tcG9uZW50O1xyXG4iLCJ2YXIgTWNDb21wb25lbnQgPSByZXF1aXJlKCcuLi8uLi8uLi9NY0NhZmUvTWNDYWZlX0NvbXBvbmVudCcpO1xyXG5cclxudmFyIHRwbCA9IHJlcXVpcmUoJy4uL3RwbC9jaGlsZF9jb21wb25lbnQnKTtcclxuXHJcbnZhciBjb21wb25lbnQgPSBNY0NvbXBvbmVudC5jcmVhdGVDb21wb25lbnQoe1xyXG4gIHRwbDogdHBsLFxyXG4gIHN0YXRlOiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY2hpbGQ6IHtcclxuICAgICAgICB2YWw6ICdNb21vJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBkaWRNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAkKHRoaXMudGFyZ2V0KS5vbignY2xpY2snLCAnI2J0bi1jaGlsZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBhbGVydCgnY2xpY2sgY2hpbGQgYnV0dG9uJyk7XHJcbiAgICAgIGFwcFN0YXRlLnNldE51bWJlcignMycpO1xyXG4gICAgfSlcclxuICB9LFxyXG4gIGRpZFVuTW91bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgJCh0aGlzLnRhcmdldCkub2ZmKCk7XHJcbiAgfSxcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBvbmVudDtcclxuIiwiKGZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7aWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge21vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO30gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcpIHtkZWZpbmUoZGVmaW5pdGlvbik7fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUucGV0YWwgPT09ICdvYmplY3QnKSB7ZGVmaW5lKG5hbWUsIFtdLCBkZWZpbml0aW9uKTt9IGVsc2Uge3RoaXNbbmFtZV0gPSBkZWZpbml0aW9uKCk7fX0pKCd0bXBsJywgZnVuY3Rpb24gKHRtcGwpIHtyZXR1cm4gZnVuY3Rpb24gYW5vbnltb3VzKG9ialxuLyoqLykge1xudmFyIHA9W107d2l0aChvYmope3AucHVzaCgnPGgyPkNoaWxkIENvbXBvbmVudDwvaDI+PHVsPiAgPGxpPjxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPVwiJywgY2hpbGQsJ1wiIGlkPVwiY2hpbGRcIiAvPjwvbGk+ICA8bGk+PGJ1dHRvbiBpZD1cImJ0bi1jaGlsZFwiPkNoaWxkIEJ1dHRvbjwvQnV0dG9uPjwvbGk+PC91bD4nKTt9IHJldHVybiBwLmpvaW4oJycpO1xufX0pIiwiKGZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7aWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge21vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO30gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcpIHtkZWZpbmUoZGVmaW5pdGlvbik7fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUucGV0YWwgPT09ICdvYmplY3QnKSB7ZGVmaW5lKG5hbWUsIFtdLCBkZWZpbml0aW9uKTt9IGVsc2Uge3RoaXNbbmFtZV0gPSBkZWZpbml0aW9uKCk7fX0pKCd0bXBsJywgZnVuY3Rpb24gKHRtcGwpIHtyZXR1cm4gZnVuY3Rpb24gYW5vbnltb3VzKG9ialxuLyoqLykge1xudmFyIHA9W107d2l0aChvYmope3AucHVzaCgnPGgxPkNvbXBvbmVudC0xPC9oMT48dWw+ICA8bGk+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCInLCBuYW1lLCdcIiBpZD1cIm5hbWVcIiAvPjwvbGk+ICA8bGk+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCInLCBudW1iZXIsJ1wiIGlkPVwibnVtYmVyXCIgLz48L2xpPiAgPGxpPjxidXR0b24gaWQ9XCJidG5cIj5CVVRUT048L0J1dHRvbj48L2xpPiAgPGxpPjxidXR0b24gaWQ9XCJidG4tdG8tY29tcG9uZW50MlwiPkdvIFRvIENvbXBvbmVudCAyPC9CdXR0b24+PC9saT4gIDxsaT48YnV0dG9uIGlkPVwiYnRuLXRvLWhhc2hcIj5HbyBUbyBoYXNoPC9CdXR0b24+PC9saT48L3VsPjxkaXYgaWQ9XCJjaGlsZC1jb21wb25lbnRcIj48L2Rpdj4nKTt9IHJldHVybiBwLmpvaW4oJycpO1xufX0pIiwiKGZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7aWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge21vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO30gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcpIHtkZWZpbmUoZGVmaW5pdGlvbik7fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUucGV0YWwgPT09ICdvYmplY3QnKSB7ZGVmaW5lKG5hbWUsIFtdLCBkZWZpbml0aW9uKTt9IGVsc2Uge3RoaXNbbmFtZV0gPSBkZWZpbml0aW9uKCk7fX0pKCd0bXBsJywgZnVuY3Rpb24gKHRtcGwpIHtyZXR1cm4gZnVuY3Rpb24gYW5vbnltb3VzKG9ialxuLyoqLykge1xudmFyIHA9W107d2l0aChvYmope3AucHVzaCgnPGgxPkNvbXBvbmVudC0yPC9oMT48dWw+ICA8bGk+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCInLCBoZWlnaHQsJ1wiIGlkPVwiaGVpZ2h0XCIgLz48L2xpPiAgPGxpPjxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPVwiJywgd2VpZ2h0LCdcIiBpZD1cIndlaWdodFwiIC8+PC9saT4gIDxsaT48YnV0dG9uIGlkPVwiYnRuLTJcIj5CVVRUT04gMjwvQnV0dG9uPjwvbGk+ICA8bGk+PGJ1dHRvbiBpZD1cImJ0bi10by1pbmRleFwiPkdvIFRvIEluZGV4PC9CdXR0b24+PC9saT48L3VsPicpO30gcmV0dXJuIHAuam9pbignJyk7XG59fSkiXX0=
