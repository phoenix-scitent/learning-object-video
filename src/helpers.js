//TODO: split this out into seperate module?

var generateUUID = function({ prefix = Date.now(), postfix = Date.now() }){
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return `${prefix}-${uuid}-${postfix}`;
};

module.exports = {
  generateUUID: generateUUID
};