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
		var state = {
			routers: [], // [{'path': '/index', 'params': ['a', 'b'], 'component': Function}]
			router: '', // 当前路由
			params: {}, // 路由参数
		}
		/*
		 * @params routers Array
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
				state.routers.push(_router);
			}
		}

		/*
		 * @des 设置当前路由、参数
		 */
		function handleRouter () {
			var _hash = location.hash;
			var _routers = state.routers;
			for(var i=0,l=_routers.length; i<l; i++) {
				var _routersItem = _routers[i];
				var _path = _routersItem.path;
				var _params = _routersItem.params;
				var _reg = _path;
				for (var j=0, ll=_params.length; j<ll; j++) {
					_reg += '/.{1,}';
				}
				// 是否匹配当前路由
				if ((new RegExp(_reg)).test(_hash)) {
					// 设置 router
					state.router = _path;
					// 设置 params
					var _hashPrams = _hash.split(_path)[1].split('/');
					for (var k=0, lll=_routersItem.params.length; k<lll; k++) {
						state.params[_routersItem.params[k]] = _hashPrams[k+1];
					}
					break;
				}
			}
		}
		/*
		 * @param router String
		 */
		function goTo (router) {
			location.hash = router;
		}
		/*
		 * @des 返回当前路由
		 */
		function getRouter () {
			handleRouter ();
			return state.router;
		}
		/*
		 * @des 返回当前路由参数
		 */
		function getParams () {
			return state.params;
		}
		/*
		 * @des 对外方法
		 */
		return {
			createRouter: createRouter,
			goTo        : goTo,
			handleRouter: handleRouter,
			getRouter   : getRouter,
			getParams   : getParams,
		}
	})()

	return McCafeRouter;
})
