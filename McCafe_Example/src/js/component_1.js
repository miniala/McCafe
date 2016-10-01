var McRouter = require('../../../McCafe/McCafe_Router');
var McComponent = require('../../../McCafe/McCafe_Component');

var tpl = require('../tpl/component_1');

var childComponent = require('./component_child');

var component = McComponent.createComponent({
  tpl: tpl,
  state: function(){
    return {
      name: {
        val: 'Momo'
      },
      number: {
        val: '1',
        callback: ['changeInput1']
      }
    }
  },
  didMount: function() {
    $(this.target).on('click', '#btn', function() {
      alert('click button');
    })
    $(this.target).on('click', '#btn-to-component2', function() {
      McRouter.goTo('/component2');
    })
    $(this.target).on('click', '#btn-to-hash', function() {
      location.hash = '/component2';
    })
    childComponent.mount('#child-component');
  },
  didUnMount: function() {
    $(this.target).off();
    childComponent.unMount();
  },
  changeInput1: function() {
    $(this.target).find('#number').val(this.getState('number'));
  },
  upateNumber: function(number) {
    this.setState({
      number: number
    })
  },
});

module.exports = component;