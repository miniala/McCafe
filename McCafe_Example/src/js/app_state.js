var component1 = require('./component_2');

var McState = require('../../../McCafe/McCafe_State');

var appState = new McState({
  number: {
    val: '',
    callback: [updateNumber]
  }
})

var setNumber = function(number) {
  appState.setState({
    'number': number
  })
}

function updateNumber() {
  component1.upateNumber(appState.getState('number'))
}

module.exports = {
  setNumber: setNumber
};
