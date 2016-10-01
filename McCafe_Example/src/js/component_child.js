var McComponent = require('../../../McCafe/McCafe_Component');

var tpl = require('../tpl/child_component');

var component = McComponent.createComponent({
  tpl: tpl,
  state: function(){
    return {
      child: {
        val: 'Momo'
      }
    }
  },
  didMount: function() {
    $(this.target).on('click', '#btn-child', function() {
      alert('click child button');
      appState.setNumber('3');
    })
  },
  didUnMount: function() {
    $(this.target).off();
  },
});

module.exports = component;
