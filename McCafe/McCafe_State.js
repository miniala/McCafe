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