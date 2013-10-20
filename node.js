exports.connect = function(address, callback) {
  callback();
}

exports.get = function(namespace, key, callback) {
  var value = null;
  callback(value);
}

exports.put = function(namespace, key, value, callback) {
  callback();
}

exports.lscan = function(namespace, callback) {
  var values = [];
  callback(values);
}

exports.lscan = function(callback) {
  var values = [];
  callback(values);
}

exports.setGlobal = function(object, callback) {
  callback();
}

exports.getGlobal = function(callback) {
  var object = null;
  callback(object);
}

exports.addGlobalList = function(list, callback) {
  callback();
}

exports.getGlobalList = function(callback) {
  var list = [];
  callback(list);
}

exports.send = function(key, message, callback) {
  callback();
}

exports.send = function(message, callback) {
  callback();
}

exports.registerMessageHandler = function(func) {
  return;
}

exports.insertPHT = function(name, key, values, callback) {
  callback();
}

exports.findPHT = function(name, key, callback) {
  var value = null;
  callback(value);
}

exports.rangePHT = function(name, startKey, endKey, callback) {
  var list = [];
  callback(list);
}