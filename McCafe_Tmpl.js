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
})('tmpl', function (tmpl) {

  'use strict';

  // 缓存
  var cache = {};

  /*
   * @name tmpl
   * @param str String 模板
   * @param data object 数据
   * @base on John Resig – http://ejohn.org/ – MIT Licensed
   */
  var tmpl = function tmpl(str, data){
    // Figure out if we’re getting a template, or if we need to
    // load the template – and be sure to cache the result.
    var fn = !/\W/.test(str) ?
    cache[str] = cache[str] ||
    tmpl(document.getElementById(str).innerHTML) :

    // Generate a reusable function that will serve as a template
    // generator (and which will be cached).
    new Function("obj",
    "var p=[],print=function(){p.push.apply(p,arguments);};" +

    // Introduce the data as local variables using with(){}
    "with(obj){p.push('" +

    // Convert the template into pure JavaScript
    str
      .replace(/[\r\t\n]/g, " ")
      .split("<%").join("\t") .replace(/((^|%>)[^\t]*)'/g, "$1\r")
      .replace(/\t=(.*?)%>/g, "',$1,'")
      .split("\t").join("');")
      .split("%>").join("p.push('")
      .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };

  /*
   * @name redner
   * @param selector String 渲染选择器
   * @param str String 模板
   * @param data object 数据
   */
  var render = function (selector, str, data) {
    var _str = str;
    if (data) _str = tmpl(str, data);
    if (typeof selector == 'string') {
      var selectors = document.querySelectorAll(selector);
      var _length = selectors.length;
      for (var i=0; i<_length; i++) {
        selectors[i].innerHTML = _str;
      }
    } else {
      selector.innerHTML = _str;
    }
  }

  return {
    tmpl  : tmpl,
    render: render
  }
})
