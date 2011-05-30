#!/usr/bin/env node

/**
  @author Josh Perez <josh@goatslacker.com>
  @version 1.0

  @depends jshint, uglify, gzip, less
  */

const args = process.argv.splice(2);

// Requires
const fs = require("fs");

// Forge Settings
// pulled from forge.json if it exists, otherwise uses default settings
const config = (function () {

  var fallback = {
    /* appName = the directory name */
    appName: (function () {
      var real = fs.realpathSync("."),
          dir = real.split("/");

      return dir.pop();
    }()),
  
    /* the build directory */
    buildDirectory: 'build',

    /* use lint to check the code */
    lint: true,

    /* uglify-js compresses the code */
    compress: true,

    /* apply gzip after compression */
    gzip: true,

    /* less for stylesheets */
    less: false,

    /* no logging for Forge */
    quiet: false
  },

  options = {};

  try {
    options = JSON.parse(fs.readFileSync("forge.json"));
  } catch (e) {
  }

  // default settings
  Object.keys(fallback).forEach(function (key) {
    options[key] = (typeof options[key] === "undefined") ? fallback[key] : options[key];
  });

  return options;
}());

// Other requires from options given
var jshint = config.lint ? require("jshint").JSHINT : null,
    uglify = config.compress ? require("uglify-js") : null,
    gzip = config.gzip ? require("gzip") : null,
    less = config.less ? require("less") : null;
// TODO jsdocs
// node module doesn't exist :(

// Forge Object

var Forge = function (file) {
  this.fileName = file;
};

Forge.prototype = {

  forge: function (files, ext) {
    const log = (!config.quiet);

    var code = "";

    if (log) {
      console.log('\nReading...');
    }

    ext = ext || 'js';

    // loop through each file in the directory
    files.forEach(function (fileName) {
      var file = (("." + ext).indexOf(fileName) === -1) ? fileName : fileName + '.' + ext;

      if (log) {
        console.log('> ./' + file);
      }

      // read the contents of the files
      code = code + fs.readFileSync(file, 'utf8');
    });

    // write output file
    fs.writeFileSync(this.fileName, code);

    if (log) {
      console.log('Wrote to: ./' + this.fileName);
    }

    return code;
  },

  compress: function (code) {
    this.minFile = Forge.getBuildFile("min.js");

    const jsp = uglify.parser;
    const pro = uglify.uglify;

    const log = (!config.quiet);

    var parsed = "",
        mangled = "",
        squeeze = "",
        compressed = "";

    try {
      parsed = jsp.parse(code);
      mangled = pro.ast_mangle(parsed);
      squeeze = pro.ast_squeeze(mangled);
      compressed = pro.gen_code(squeeze);
    } catch (e) {
      // if there's any errors
    }

    if (log) {
      console.log('\nCompressing ./' + this.fileName + ' using uglify-js');
    }

    fs.writeFileSync(this.minFile, compressed);

    if (log) {
      console.log('Compressed into ./' + this.minFile);
    }
  },

  jshint: function (code) {
    const log = (!config.quiet);

    var data = "";

    if (log) {
      console.log('\nValidating ./' + this.fileName + ' with jshint');
    }

    // run jshint on the code
    jshint(code);

    // get data
    data = jshint.data();

    // if there are no errors
    if (!data.errors) {
      if (log) {
        console.log('Lint Free!');
      }

      return;
    }

    // output errors to console
    data.errors.forEach(function (error) {
      console.log(error.evidence + ':' + error.line + ':' + error.character + ' ' + error.raw);
    });
  },

  gzip: function () {
    this.gzipFile = Forge.getBuildFile("js.gz");

    const log = (!config.quiet);

    if (log) {
      console.log('\nApplying gzip compression');
    }

    var self = this,
        file = this.minFile || this.fileName,
        code = fs.readFileSync(file);

    gzip(code, function (err, data) {
      fs.writeFileSync(self.gzipFile, data);
    });
  }
};

Forge.getBuildFile = function (ext) {
  return config.buildDirectory + "/" + config.appName + "." + ext;
};

/** */
(function () {
  const log = (!config.quiet);

  var files = config.files ? config.files : (function () {
    var path = args[0] || "src",
        src = fs.readdirSync(path),
        js = [];

    src.forEach(function (file) {
      js.push(path + "/" + file);
    });

    return { js: js };
  }()),
  
  doForge = function (ext) {
    var buildFile = Forge.getBuildFile(ext),

        // create new forging object
        forger = new Forge(buildFile),

        // the code in all it's glory
        code = forger.forge(files[ext], ext);

    // jshint
    if (jshint) {
      forger.jshint(code);
    }

    // compress code
    if (uglify) {
      forger.compress(code);
    }   

    // gzip
    if (gzip) {
      forger.gzip();
    }
  };

  if (log) {
    console.log('Forging ' + config.appName);
  }

  // create build directory
  try {
    fs.mkdirSync(config.buildDirectory, 0777);
  } catch (e) {
    // may return a file exists error...
  }

  // do forge
  Object.keys(files).forEach(function (ext) {
    doForge(ext);
  });

  // Done :)
  if (log) {
    console.log('\nDone!');
  }
}());
