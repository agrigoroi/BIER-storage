var Node = module.exports = {
  connect: function(address, callback) {
    callback();
  }

  get: function(namespace, key, callback) {
    var value = null;
    callback(value);
  }

  put: function(namespace, key, value, callback) {
    callback();
  }

  //This thing doesnt work
  lscan: function(namespace, callback) {
    var values = [];
    callback(values);
  }

  lscan: function(callback) {
    var values = [];
    callback(values);
  }

  setGlobal: function(object, callback) {
    callback();
  }

  getGlobal: function(callback) {
    var object = null;
    callback(object);
  }

  addGlobalList: function(list, callback) {
    callback();
  }

  getGlobalList: function(callback) {
    var list = [];
    callback(list);
  }

  // This thing doest work
  send: function(key, message, callback) {
    callback();
  }

  send: function(message, callback) {
    callback();
  }

  registerMessageHandler: function(func) {
    return;
  }

  insertPHT: function(name, key, values, callback) {
    callback();
  }

  findPHT: function(name, key, callback) {
    var value = null;
    callback(value);
  }

  rangePHT: function(name, startKey, endKey, callback) {
    var list = [];
    callback(list);
  }
}