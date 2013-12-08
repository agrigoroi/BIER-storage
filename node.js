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

  /**
   * Connects to the a BIER network:
   * If addresses is not an array or is empty, connects to the default bootstraps:
   *   [127.0.0.1:3000, 127.0.0.1:3001, 127.0.0.1:3002]
   *
   * @param  {Array} addresses - The addresses of one or more bootstrap nodes.
   */
  connect: function(addresses, callback) {
    if(addresses instanceof Array && addresses.length > 0) 
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

  /**
   * Gets an object stored in the network:
   * If such an object couldn't been found returns null
   *
   * @param  {String} namespaces - The namespace of the object.
   * @param  {String} key - The key of the object.
   * @return {Object} 
   */
  get: function(namespace, key, callback) {
    Node.node.get(generateHash(namespace, key), function(value) {
      callback(JSON.parse(value));
    });
  },

  /**
   * Stores any type in the network:
   * The object is transformed in a string using JSON.strigify before being stored.
   *
   * @param  {String} namespaces - The namespace of the object.
   * @param  {String} key - The key of the object.
   * @param  {Any}    value - The value to be stored.
   * @param  {Number} keepAlive - The duration in seconds to keep this object
   */
  put: function(namespace, key, value, keepAlive, callback) {
    obj = {namespace: namespace, key: key, value:value};
    Node.node.put(generateHash(namespace, key), JSON.stringify(obj), keepAlive, callback);
  },

  /**
   * Scan all the data from a namespace stored locally in this node:
   * 
   * Returns an object of form:
   * {
   *   key1: value1,
   *   key2: value2,
   *   ...
   *  }
   * If namespace is null, scans all the namespaces and returns an object of form:
   * {
   *   namespace1: {
   *     key1: value1,
   *     ...
   *    },
   *   namespace2: { ... },
   *   ...
   * }
   * 
   * @param  {String} namespace - the namespace that we want the object from.
   * 
   */
  lscan: function(namespace, callback) {
    var store = Node.node._store;
    store.keys(function(keys) {
      var results = {};
      var left = keys.length;
      if(left == 0) 
        callback({});
      for(key in keys) {
        store.retrieve(keys[key], function(value, exp) {
          try {
            value = JSON.parse(value);
            if(value.namespace == namespace)
              results[value.key] = value.value;
            if(namespace == null)
              results[value.namespace][value.key] = value.value;
          } catch(e) {
            console.log("Stored value \"" + value + "\" is not a BIER-storage object, ignoring");
          } finally {
            left=left-1;
            if(left==0)
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
