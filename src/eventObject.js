import $ from 'jquery';

var eventObject = function(emitter){
  return {
    addListener: function(type, listener){ return emitter.on(type, listener) },
    removeListener: function(type, listener){ return emitter.off(type, listener) }
  }
};

module.exports = {
  eventObject
};