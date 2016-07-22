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
})('state', function (state) {

  'use strict';

  /*
   * @Name State
   * @param Object obj eg: {, state : {val: value, callback: [,function]}}
   */ 
  var State = function (obj) {
    this.state = obj;
  }
  /*
   * @Function setState
   * @param Object obj
   */
  State.prototype.setState = function (obj) {
    var that = this;
    var callBackCache = [];
    for (var k in obj) {
      // 值有改变
      if (!obj[k] || obj[k] != that.state[k].val) {
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
    }
    callBackCache.forEach(function (cacheItem, cacheIndex) {
      if(typeof cacheItem === 'function') cacheItem();
    })
    callBackCache = null;
  }
  /*
   * @Function getState
   * @param String state
   */
  State.prototype.getState = function (state) {
    return this.state[state].val;
  }
  /*
   * @Function bind
   * @param String key
   * @param Function callback
   */
  State.prototype.bind = function (key, callback) {
    var that = this;
    if (!that.state.hasOwnProperty(key)) return;
    if (!that.state[key].callback) {
      that.state[key].callback = []
    }
    that.state[key].callback.push(callback);
  }

  return State;

})
