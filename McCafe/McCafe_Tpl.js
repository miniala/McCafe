/*
 * @github https://github.com/miniala/McCafe
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.tmpl = global.tmpl || {})));
}(this, (function (exports) { 'use strict';

  // 缓存
  var cache = {};

  /*
   * @name tmpl
   * @param str String 模板
   * @param data object 数据
   * @base on John Resig – http://ejohn.org/blog/javascript-micro-templating/
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
    "var p=[];" +

    // Introduce the data as local variables using with(){}
    "with(obj){p.push('" +

    // Convert the template into pure JavaScript
    str
      .replace(/[\r\t\n]/g, "")
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
   * @param data Object 数据
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

  var goTo = function (selector, str, data) {
    var _str = str;
    if (data) _str = tmpl(str, data);
    var $currentWraper = $('.wraper');
    var $wraper = $('<div class="wraper" style="transition: .6s; position: absolute; height: 100%; width: 100%; top: 0; left: 0; transform: translate(100%) scale(.6)"></div>')
    $wraper.html(_str);
    $('#container').append($wraper);
    setTimeout(function () {
      $wraper.css({transform: 'translate(0)'});
      $currentWraper.css({transform: 'translate(-100%) scale(.6)'});
    },10)
    setTimeout(function(){
      $currentWraper.remove()
    }, 1000)
  }

  return {
    tmpl  : tmpl,
    render: render,
    goTo: goTo
  }

})));