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
  messageHandler: null,

  connect: function(addresses, callback) {
    if(addresses instanceof Array) 
      config.bootstraps = addresses;
    Node.node = KadOH.node = new KadOH.logic.KademliaNode(undefined, config);
    Node.node.connect(function() {
      Node.node.join(callback);
      Node.node._store.on("save", function(keyValue) {
        try {
          var value = JSON.parse(keyValue.value);
          if(value.hasOwnProperty("message")) {
            //It's a message
            //if message is for this user
            //   and a function to handle messages is registered 
            //     then notify the user
            if(keyValue.key == node.getID()) 
              if(Node.messageHandler !== null)
                Node.messageHandler(value.message);
            //Remove this key
            Node.node._store._expire(keyValue);
          }
        } catch(err) {
          //Hmm not an object, dont know what to do with such case, as they dont happen
          console.log("value not object" + keyValue.value+": "+err);
        }
      });
    });
  },

  get: function(namespace, key, callback) {
    Node.node.get(generateHash(namespace, key), function(value) {
      callback(JSON.parse(value));
    });
  },

  put: function(namespace, key, value, keepAlive, callback) {
    obj = {namespace: namespace, key: key, value:value};
    Node.node.put(generateHash(namespace, key), JSON.stringify(obj), keepAlive, callback);
  },

  lscan: function(namespace, callback) {
    //Hack to get storage manager
    var store = Node.node._store;
    var results = {};
    store.keys(function(keys) {
      var left = keys.length;
      for(key in keys) {
        store.retrieve(keys[key], function(value, exp) {
          results[keys[key]] = value;
          left=left-1;
          if(left==0) {
            callback(results);
          }
        });
      }
    });
  },

  // This thing doest work
  send: function(key, message, callback) {
    var obj = {message: message};
    Node.node.put(key, JSON.stringify(obj), null, callback);
  },

  registerMessageHandler: function(func) {
    Node.messageHandler = func;
  }


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

  // send: function(message, callback) {
  //   callback();
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
