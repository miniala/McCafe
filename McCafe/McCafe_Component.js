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