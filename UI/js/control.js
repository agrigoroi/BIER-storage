KadOHui = (typeof KadOHui !== 'undefined') ? KadOHui : {};

KadOHui.Control = function(node) {
  this.node = node;
  this.control = $("#control");

  this.joinBtn    = $("#join_btn").button();

  this.putBtn     = $("#put_btn").button();
  this.putNamespace=$("#put_namespace");
  this.putKey     = $("#put_key");
  this.putValue   = $("#put_value");
  this.putResult  = $("#put_result");

  this.getBtn     = $("#get_btn").button();
  this.getKey     = $("#get_key");
  this.getNamespace=$("#get_namespace");
  this.getResult  = $("#get_result");

  this.pingBtn     = $("#ping_btn").button();
  this.pingAddress = $("#ping_address");
  this.pingResult  = $("#ping_result");

  this.initGet()
      .initPut();
};

KadOHui.Control.prototype = {

  initGet: function() {
    var that = this;
    var result = this.getResult;
    var loader = result.find('.loader');
    var content = result.find('.content');
    result.hide();
    var onGet = function() {
      that.getBtn.unbind('click', onGet)
                 .button('toggle');
      var namespace = that.getNamespace.val();
      var key = that.getKey.val();
      content.hide();
      loader.show();
      result.show();
      BIERstorage.Node.get(namespace, key, function(value) {
        var text;
        if (!value) {
          text = '<strong>value not found for this namespace and key</strong>';
        } else {
          text = value;
        }
        content.html('<h4>Result</h4><p>'+text+'</p>');
        loader.hide();
        content.show();
        that.getBtn.click(onGet)
                   .button('toggle');
      });
    };
    this.getBtn.click(onGet);
    return this;
  },

  initPut: function() {
    var that = this;
    var tbody = this.putResult.find('tbody');
    var onPut = function() {
      that.putBtn.unbind('click', onPut)
                 .button('toggle');
      var value = that.putValue.val();
      var namespace = that.putNamespace.val();
      var key = that.putKey.val(); 
      BIERstorage.Node.put(namespace, key, value, function(key) {
        tbody.append(
          "<tr>" +
          "<td><code>"+key+"</code></td>" +
          "<td>"+value.slice(0, 20)+(value.length > 20 ? "..." : "")+"</td>" +
          "</tr>");
        that.putBtn.click(onPut)
                   .button('toggle');
      });
    };
    this.putBtn.click(onPut);
    return this;
  },

};