var kadoh = require("kadoh");
var node = undefined;
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

function createNode(options) {
  node = new KadOH.Node(undefined, options);
}

exports.connect = function(options, callback) {
  if(options === undefined)
    options = config;
  if(node === undefined)
    createNode(options);  
  node.connect(function() {
    node.join(callback);
  });
}

function convert(namespace, key) {
  //TODO:
  return namespace+key;
}

exports.put = function(namespace, key, value) {
  if(node === undefined) {
    //Called without connect
    //TODO: handle this case
    throw new Error("put called without connecting first");
  } else {
    node.put(convert(namespace, key));
  }
}

exports.get = function(namespace, key, callback) {
  if(node === undefined) {
    //Called without connect
    //TODO: handle this case
    throw new Error("put called without connecting first");
  } else {
    node.get(convert(namespace, key), callback);
  } 
}