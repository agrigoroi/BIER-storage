var KadOH = require("kadoh");
var crypto = KadOH.util.crypto;
var config = {
  bootstraps : ["127.0.0.1:3000", "127.0.0.1:3001", "127.0.0.1:3002"],
  reactor : {
    protocol  : 'jsonrpc2',
    type      : 'SimUDP',
    transport : {
      transports : [
        'flashsocket', 
        'htmlfile', 
        'xhr-multipart', 
        'xhr-polling', 
        'jsonp-polling'
      ]
    }
  }
};

generateHash = function(namespace, key) {
  return crypto.digest.SHA1(namespace+key);
}

var Node = module.exports = {
  node: null,

  connect: function(addresses, callback) {
    if(addresses instanceof Array) 
      config.bootstraps = addresses;
    Node.node = KadOH.node = new KadOH.logic.KademliaNode(undefined, config);
    Node.node.connect(function() {
      Node.node.join(callback);
    });
  },

  get: function(namespace, key, callback) {
    Node.node.get(generateHash(namespace, key), callback);
  },

  put: function(namespace, key, value, keepAlive, callback) {
    obj = {namespace: namespace, key: key, value:value};
    Node.node.put(generateHash(namespace, key), JSON.stringify(obj), keepAlive, callback);
  }

  // //This thing doesnt work
  // lscan: function(namespace, callback) {
  //   var values = [];
  //   callback(values);
  // }

  // lscan: function(callback) {
  //   var values = [];
  //   callback(values);
  // }

  // setGlobal: function(object, callback) {
  //   callback();
  // }

  // getGlobal: function(callback) {
  //   var object = null;
  //   callback(object);
  // }

  // addGlobalList: function(list, callback) {
  //   callback();
  // }

  // getGlobalList: function(callback) {
  //   var list = [];
  //   callback(list);
  // }

  // // This thing doest work
  // send: function(key, message, callback) {
  //   callback();
  // }

  // send: function(message, callback) {
  //   callback();
  // }

  // registerMessageHandler: function(func) {
  //   return;
  // }

  // insertPHT: function(name, key, values, callback) {
  //   callback();
  // }

  // findPHT: function(name, key, callback) {
  //   var value = null;
  //   callback(value);
  // }

  // rangePHT: function(name, startKey, endKey, callback) {
  //   var list = [];
  //   callback(list);
  // }
}
