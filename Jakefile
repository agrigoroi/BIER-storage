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

      process.stdout.write(checked);
    };
  }

  desc('Building the brower-side code with xmpp configuration');
  task('xmpp', ['default'], build('xmpp', false));

  desc('Building the brower-side code with simudp configuration');
  task('simudp', ['default'], build('simudp', false));
});