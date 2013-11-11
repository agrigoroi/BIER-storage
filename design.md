## Design Document ##

### Introduction ###

A peer-to-peer (P2P) network is a distributed network in which individual components (called "peers") act as both suppliers and consumers of resources, in contrast to the centralized client–server model where client nodes request access to resources provided by central servers. In P2P networks, peers aim to successfully communicate with one another to perform tasks without any need of coordination through servers.

Distributed Hash Table (DHT) can be used to provide a logical structure to a peer to peer network with a lookup service based on hash keys. Responsibility for maintaining the mapping from keys to values is distributed among the nodes, in such a way that a change in the set of participants only causes minimal amounts of disruption.

Traditionally, for data storage, especially of structured data, distributed applications use a client-server approach. One physical (or virtual) machine acts as a database server and all the instances of the application use this server to search, create, read, update or delete (CRUD) information. Such an approach is hard and expensive to scale in case the quantity of stored information increases or in case the number of request over a fixed period of time increases.
One of the approaches that has been proposed to overcome this problem is to adopt a peer to peer paradigm, which promises natural scalability.

### Motivation ###
Some native desktop applications use a peer to peer model approach to data storage. Particularly, applications such as CrashPlan and Bittorrent sync support the back up of important files using a DHT network. However, none of the existing solutions work inside a browser and as a consequence are of limited use for browser-based web applications. One question that arises is whether one can use the advanced functionalities of web technologies to develop a better P2P storage layer.

Researchers at University of California at Berkeley develop PIER (Peer-to-peer Information Exchange and Retrieval) which, in essence, is a prototype of a relational database built on top of a DHT network. This piece of software and related papers publish in the course of that research project will act as a proof of concept and a helpful guide for my project.

The idea is to build a P2P relational database storage layer and making use of web technologies running in JavaScript. I believe that this will be of great use for web application by reducing the requirements for server resources, increasing scalability and removing the single point of failure. 

### Problem Statement ###
As my third year project, I will build a data storage solution that will use a peer to peer model. This solution will target desktop and mobile web applications that are built to run inside a browser. The software will be built as a JavaScript library and will be able to run in any modern web browser on computers, tablets or smartphones as well as natively on Linux using node.js. 

The visionary idea of my project is to build a relational database on top of a DHT network that can run in a browser. As the database will be distributed over a peer-to-peer network, each node will act as a client - querying to search, create, read, update and delete (CRUD) information as well as a server - processing such queries (including from other nodes) and storing bits of the data. The library will also allow nodes to build prefix hash trees, which as shown in PIER, make range searches feasible. 

### Technical Challenges ###
One challenge is posed by browser limitation regarding connection acceptance. Application running inside most browsers are generally not allowed to listen to connection on a specific port or be on Local Area Network behind a Network Address Translation (NAT) box, as a result, the architecture of the network will contain special nodes which run natively on some computers and will act as a proxy for the rest of the nodes. Such an architecture is successfully used by Skype, where some “super-nodes” act as intermediary nodes in helping other nodes establish direct contact.

The eight fallacies of distributed computing characterize a series of challenges to building a robust and reliable library. Due to the fact that the nodes can be switched on and off without restriction of any kind, it will not be possible to guarantee complete integrity or availability of the data. Some of these limitation can be mitigated by implementing duplication of data, however this may significantly increase the network cost. A decision on this trade-off should be based on the importance of the specific data as well as its size. Many other trade-offs will appear during development, sensible decisions will be made in each of them. The decisions themselves as well as the reasons behind them will be documented in great details for future reference.

Providing security will not be a main concern of the project as the primary scope is to build a proof of concept software, yet it will not be totally ignored. Security concerns can be divided into two types: data protection and compromised nodes. 

 - Data protection: As the communication is over plain IP and there is no authentication of nodes, any data that shouldn’t be accessible by public needs to be encrypted before being stored in the network.
 - Compromised nodes: Another security concern is some nodes being compromised and spamming the network with expensive requests (e.g. “SELECT * FROM”). A high number of such queries may overload other nodes or even the network, considerably slowing down legitimate queries. 

The program, at least in its initial iteration, will not implement any solution to deal with such kind of situations, but some theoretical solution may be discussed in the report and future presentations.

### Technical Background, Tools and Assumptions ###
Most of the code for the project will be written in JavaScript. HTML and CSS will be used for the demo applications and the debug UI. The project will make use of a series of open source projects including, but not limited to, Node.js, npm, KadOH, browserify.

 - Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, for data-intensive real-time applications that run across distributed devices. Node Package Manager (npm) is a tool build to simplify the installation of node.js libraries and their dependencies.

 - Browserify is an open-source library that allows to convert [and minify] Node.js code to JavaScript that can be include in a HTML5 application running inside a browser. This will allow the same source code to be deployable in both “super nodes” running as proxies and nodes running in browser in different parts of the world.

 - KadOH is a library developed by Alexandre Lachèze and Pierre Guilleminot to help browser and mobile applications to make use of P2P networks by implementing a working DHT interface in JavaScript. This will act as the starting point for my project. 

Testing distributed applications is always a great challenge. During development,  machines in 3rd year lab will be used to initially test functions and fix bugs. When almost completed, Elastic Cloud Computing (EC2) micro instances in different data centres around the world will be used to benchmark and optimize the software. 

### Design ###
The APIs provided by project can be easily classified in 4 categories: Storage, Schema, Message and PHT. Also some additional function to connect, check the internal states and provide some statistical information will be implemented. All the network and memory communication will be asynchronous, consequently none of the function will return any information, instead they will make use of callback functions to notify when it’s complete and (if needed) return the appropriate values.

The storage functions provide a simple key-value storage in DHT network as well as a function that allows to easily iterate over all locally stored values. The later function is useful in case the user program needs to perform some kind of aggregation or selection over all the nodes instead of accessing a specific value. Multiple options exist to convert the namespace, key pair to a 160-bit number used by the DHT. The most straightforward approach is to hash both of them using a 160-bit hash function. A good candidate for such a function will need to return quite similar hash values for pair with the same namespace, so objects within the same namespace end up in nodes close to each other in DHT. The public functions provided are:

 - `put(namespace, key, value);`
The program will hash the `namespace` and `key` together to obtain a 160-bit number represented internally as a hexadecimal string.
A new JSON-object will be created containing 3 fields: `namespace`, `key` and `value`.
Then the newly create object will be stored in the DHT using the hash number as key.
**[Alvaro: Need to consider a version of put that calls back success/failure]**
 - `get(namespace, key, callback);`
The program will hash the `namespace` and `key` together the exactly same way as the put method does to obtain a 160-bit number.
It will then use this number as the key to retrieve the specific object from the DHT network.
If retrieving such an object fails it will run `callback(null)` [It is impossible to distinguish between failure to retrieve and non-existence], 
otherwise it will run `callback(object)`, where `object` will be a JSON-object that has 3 fields: the original `namespace`, `key` and `value`.
 - `lscan([namespace, ]callback);`
As denoted by the square brackets namespace is an optional parameter. 
A new empty list will be created. 
If `namespace` is provided, the function will scan all the object stored locally in this node and insert in this list all the objects that have the same `namespace` as the one provided.
If no `namespace` is provided all the locally stored objects will be inserted in the array.
Afterwards it will call `callback` providing this list as the only argument.

Message functions will provide an easy-to-use API for message exchange between the nodes that joined the DHT network. This will allow nodes to send messages to a node with a specific `id`, a node that is responsible for storing an object with a specific `namespace` and `key`, or to all reachable nodes in the DHT. The library will use the nodes in the DHT as the routing table to the desired destination. It’s important to specify that it does not provide any guarantee that the message will reach it destination. If required the user application can implement its own solution on top of this API to provide an “at least once” guarantee. The provided functions are:

 - `send(namespace, key, message);`
This function will send the `message` to the node that is responsible for storing the object identified by this `namespace` and `key`. Both `get` and `put` will make use of this method to store and retrieve objects.
 - `sendNode(nodeid, message);`
This function will send the `message` to the node that is identified by the specified `nodeid`. If such a node is unreachable or cannot be found, the message will be silently discarded somewhere along the way. **[Alvaro: Could consider a version that tried to report failure]**
 - `sendAll(message);`
This function will send the specified `message` to all the reachable nodes on the network. The `message` will receive a unique id and the node will send it to all its neighbours. If a node receives a `message` that needs to be send to all nodes it informs the user code of this node and then forwards it to all the neighbours. Any other messages with the same id will then be discarded. 
 - `registerMessageHandler(callback);`
This function register the function responsible for dealing with newly received messages. If such a function is not provided any message addressed to the user on this node will be ignored.

Schema functions will be responsible for storing a small global state of the application. This state will not be propagated instantly, and the user should be very careful when using this module so that no race-conditions are created by updating the same value in two different nodes at roughly the same time. An additional interesting feature is to allow the user to register a function that will be called each time this node becomes aware of a new global value. At the moment this doesn’t seem to be an important feature but may be implemented in future iterations. This module will provide the following functions:

 - setGlobal(name, value);
     - `name` is a string representing a unique name for this variable. If `name` was already set by another node, this call will result in undefined behaviour.
     - `value` is a JSON-object that will represent the value that needs to be stored in this variable.
     - The function will then broadcast an internal message about a new global variable to all the members of the network using the `sendAll` method provided by the messaging module.
 - `getGlobal(name, callback);`
     - `name` is a string representing a unique name for this variable.
     - The function will then check if this node is aware about a global variable with the specified `name` and call `callback` with its `value` or `null` otherwise. Note, that if `callback` receives `null` as a parameter it doesn’t mean that such a global variable doesn’t exist, it just means that this node is [yet] not aware of it. **[This function doesn't ask neighbours; it just checks locally]**