(function (name, definition) {if (typeof exports !== 'undefined' && typeof module !== 'undefined') {module.exports = definition();} else if (typeof define === 'function' && typeof define.amd === 'object') {define(definition);} else if (typeof define === 'function' && typeof define.petal === 'object') {define(name, [], definition);} else {this[name] = definition();}})('tmpl', function (tmpl) {return function anonymous(obj
/**/) {
var p=[];with(obj){p.push('<h2>Child Component</h2><ul>  <li><input type="text" value="', child,'" id="child" /></li>  <li><button id="btn-child">Child Button</Button></li></ul>');} return p.join('');
}})