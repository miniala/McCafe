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
