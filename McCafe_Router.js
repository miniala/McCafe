/*
 * @github https://github.com/miniala/McCafe
 */
(function (name, definition) {
  if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd === 'object') {
    define(definition);
  } else if (typeof define === 'function' && typeof define.petal === 'object') {
    define(name, [], definition);
  } else {
    this[name] = definition();
  }
})('McCafeRouter', function (McCafeRouter) {

'use strict';

/*
 * @Class McCafeRouter
 * @des 前端路由 格式：#/index/:param
 */
var McCafeRouter = (function () {
	var routerState = {
		routers : [],     // [{'path': '/index', 'params': ['a', 'b'], 'component': Function}]
		path    : '/',    // 路径
		params  : {},     // 参数
		history : [],     // 路由历史
	}

	/*
	 * @params Array routers 
	 * @des 创建路由 [{'path': '/index/:a/:b', 'component': Function}]
	 */
	function createRouter (routers) {
		for (var i=0; i<routers.length; i++) {
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
		}
	}

	/*
	 * @param String router
	 * @des 设置当前路由、参数
	 */
	function setRouter (router) {
		var _router = router || '/';
		var _routers = routerState.routers;
		routerState.path = '/'; 
		for(var i=0,l=_routers.length; i<l; i++) {
			var _routersItem = _routers[i];
			var _path = _routersItem.path;
			var _params = _routersItem.params;
			var _reg = '^' + _path;
			for (var j=0, ll=_params.length; j<ll; j++) {
				_reg += '/.{1,}';
			}
			_reg += '$';
			// 是否匹配当前路由
			if ((new RegExp(_reg)).test(_router)) {
				// 设置 path
				routerState.path = _path;
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
	 * @param String router
	 * @des 跳转
	 */
	function goTo (router) {
		var _router = router || '/';
		setRouter (_router);
		routerState.routers.forEach(function (item, index) {
			if (routerState.path == item.path) {
				if(item.component && typeof item.component === 'function') {
					item.component();
				}
			}
		})
		routerState.history.push(router);
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
	 * @param String str
	 * @des 返回当前路由参数
	 */
	function getParams (str) {
		return routerState.params;
	}

	/*
	 * @param String param
	 * @des 返回指定路由参数值
	 */
	function getParam (param) {
		return routerState.params[param];
	}

	/*
	 * @des 对外方法
	 */
	return {
		createRouter: createRouter,
		setRouter   : setRouter,
		getPath     : getPath,
		getParams   : getParams,
		getParam    : getParam,
		goTo        : goTo,
		goPre       : goPre,
	}
})()

return McCafeRouter;
})
