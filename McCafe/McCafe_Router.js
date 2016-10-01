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