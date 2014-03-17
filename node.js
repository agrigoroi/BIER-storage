var KadOH = require("kadoh");
var MessageRPC = KadOH.network.rpc.Message;
var crypto = KadOH.util.crypto;
var config = {
  bootstraps : ["127.0.0.1:3000", "127.0.0.1:3001", "127.0.0.1:3002"],
  reactor : {
    protocol  : 'jsonrpc2',
    type      : 'SimUDP',    
  }
};

generateHash = function(namespace, key) {
  return crypto.digest.SHA1(namespace+key);
}

var Node = module.exports = {
  
  node: null,
  _global: {},

  messageHandlerFunction: null,

  messageHandler: function(rpc) {
    var message = rpc.getMessage();
    message = JSON.parse(message);
    switch(message.type) {
      case "message":
        if(Node.messageHandlerFunction !== null) {
          Node.messageHandlerFunction(message.data, message.source);
          rpc.resolve();
        } else {
          rpc.reject();
        }
        break;
      case "global":
        var globals = message.globals;
        for(var index in globals)
          Node._global[globals[index].key] = globals[index].value;
        rpc.resolve();
        break;
      case "requestGlobal":
        var toSend = {
          type: "global",
          globals: []
        }
        for(key in Node._global)
          toSend.globals.push({key: key, value: Node._global[key]});
        Node.node.sendMessage(message.source, JSON.stringify(toSend), function() {});
        rpc.resolve();
    }
  },

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
      Node.node.join(function() {
        Node.node.messageHandler = Node.messageHandler;
        callback();
        Node.updateGlobals();
      });
    });
  },

  updateGlobals: function() {
    // Ask two neighbors about globals
    Node.node.messageNeighbors(JSON.stringify({type: "requestGlobal", source: Node.node.getID()}), 5);
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
            if(namespace == null) {
              if(results[value.namespace] === undefined) 
                results[value.namespace] = {};
              results[value.namespace][value.key] = value.value;
            }
          } catch(e) {
            console.log("Stored value \"" + value + "\" is not a BIER-storage object, ignoring");
            console.log(e.message);
          } finally {
            left=left-1;
            if(left==0)
              callback(results);
          }
        });
      }
    });
  },

  send: function(node, message, callback) {
    var toSend = {
      type: "message",
      data: message,
      source: Node.node.getID()
    }
    if(callback === undefined)
      callback = function() {return true};
    Node.node.sendMessage(node, JSON.stringify(toSend), callback);
  },

  // sendByKey: function(namespace, key, message, callback) {
  //   Node.send(generateHash(namespace, key), message, callback);
  // },

  registerHandler: function(obj) {
    //TODO: ask Tomo about the key name
    Node.registerMessageHandler(obj.message());
  },

  registerMessageHandler: function(func) {
    Node.messageHandlerFunction = func;
  },

  broadcast: function(message) {
    var toSend = {
      type: "message",
      data: message, 
      source: Node.node.getID()
    };
    Node.node.broadcast(JSON.stringify(toSend));
  },

  setGlobal: function(key, object) {
    Node._global[key] = object;
    var toSend = {
      type: "global",
      globals: [
        {
          key: key,
          value: object
        }
      ]
    }
    Node.node.broadcast(JSON.stringify(toSend));
  },

  getGlobal: function(key, callback) {
    callback(Node._global[key]);
  }

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
