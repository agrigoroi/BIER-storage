var fs = require("fs");

task('default', [], function() {
  console.log("default");
});

namespace('build', function() {

  function build(type, debug) {
    return function() {
      var browserify = require('browserify');
      var tagify = require('tagify');

      process.stdout.write('Building '+type);

      var build = browserify({debug : debug});
      build.use(tagify.flags([type, 'lawnchair']));
      build.addEntry('index-browserify.js');

      fs.writeFileSync(
        'BIER-storage.'+type+'.js',
        build.bundle()
      );

      // process.stdout.write(" Done");
    };
  }

  // desc('Building the brower-side code with xmpp configuration');
  // task('xmpp', ['default'], build('xmpp', false));

  desc('Building the brower-side code with simudp configuration');
  task('simudp', ['default'], build('simudp', false));

});

namespace('run', function() {
  
  function run(type) {
    return function(port) {
      port = parseInt(port, 10) || 8080 ;
      require(__dirname + '/apps/udp/app.js').server.listen(port);
      console.log('Server running on http://localhost:'+port);
    }
  }

  // desc('Run the mainline proxy app server');
  // task('mainline', ['generate:mainline'], run('mainline'));

  desc('Run the udp proxy app server');
  task('udp', [], run('udp'));

  // desc('Run the xmpp app server');
  // task('xmpp', ['generate:xmpp'], run('xmpp'));

  // desc('Run the boilerplate app server');
  // task('boilerplate', run('boilerplate'));
});
