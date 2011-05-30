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
    uglify = config.comress ? require("uglify-js") : null,
    gzip = config.gzip ? require("gzip") : null,
    less = config.less ? require("less") : null;
// TODO jsdocs
// node module doesn't exist :(

// Forge Object
const Forge = {

  make: function () {
  },

  compress: function (code) {
    const jsp = uglify.parser;
    const pro = uglify.uglify;

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

    return compressed;
  },

  getBuildFile: function (ext) {
    return config.buildDirectory + "/" + config.appName + "." + ext;
  },

  jshint: function (data) {

    var log = (!config.quiet);

    if (!data.errors) {
      if (log) {
        console.log('Lint Free!');
      }

      return;
    }

    data.errors.forEach(function (error) {
      console.log(error.evidence + ':' + error.line + ':' + error.character + ' ' + error.raw);
    });
  }
};




// tmp
// custom settings
config.files = {
  src: ['snake.js', 'base.js', 'vql.js', 'web.db.js'] // || src/, stylesheets/
};


/** */
(function () {

  var path = args[0] || ".",
      log = (!config.quiet);


  if (config.files) {
//    Forge.make(config.files);
  } else {
  }

  // automatically do it...
/*
  fs.readdir(path, function (err, files) {

    files.forEach(function (file) {
    });

  });
*/

  if (log) {
    console.log('Forging ' + config.appName);
  }

  // create build directory
  try {
    fs.mkdirSync(config.buildDirectory, 0666);
  } catch (e) {
    // may return a file exists error...
  }

  // config file was set...

  // loop through each directory
  Object.keys(config.files).forEach(function (dir) {

    var code = "",
        
    // TODO determine proper extension
        buildFile = Forge.getBuildFile("js");

    if (log) {
      console.log('\nReading...');
    }

    // loop through each file in the directory
    config.files[dir].forEach(function (fileName) {

      if (log) {
        console.log('> ' + fileName);
      }

      var file = dir + "/" + fileName;

      // read the contents of the files
      code = code + fs.readFileSync(file, 'utf8');
    });

    // write output file
    fs.writeFileSync(buildFile, code);

    if (log) {
      console.log('Wrote to: ' + buildFile);
    }

    // jshint
    if (jshint) {
      if (log) {
        console.log('\nValidating ' + buildFile + ' with jshint');
      }

      jshint(code);
      Forge.jshint(jshint.data());
    }

    // compress code
    if (uglify) {
      if (log) {
        console.log('\nCompressing ' + buildFile + ' using uglify-js');
      }

      fs.writeFileSync(Forge.getBuildFile("min.js"), Forge.compress(code));
    }   

    if (log) {
      console.log('Compressed into ' + Forge.getBuildFile('min.js'));
    }

    // gzip
    if (gzip) {
/*
      if (log) {
        console.log('\nApplying gzip compression');
      }

      gzip(compressed, function (err, data) {
        fs.writeFileSync(Forge.getBuildFile("js.gz"), data);
      });
*/
    }

  });

  if (log) {
    console.log('\nDone!');
  }
}());
