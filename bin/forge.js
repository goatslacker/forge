#!/usr/bin/env node

/**
  @author Josh Perez <josh@goatslacker.com>
  @version 1.0

  @depends jshint, uglify, gzip, less
  */

/**
  If property isn't set, it sets the default value
  @param obj {Object} the base object
  @param defaults {Object} the object with the default values
  @return {Object}
  */
const fallback = function (obj, defaults) {
  Object.keys(defaults).forEach(function (key) {
    obj[key] = (typeof obj[key] === "undefined") ? defaults[key] : obj[key];
  });

  return obj;
};

/**
  App arguments
  */
const args = (function (argv) {
  var obj = {};

  argv.forEach(function (item) {
    if (item.indexOf("--") !== -1) {
      obj[item.replace("--", "")] = argv.pop();   
    }
  });

  return fallback(obj, { js: 'src' });
}(process.argv.splice(2)));

// Requires
const fs = require("fs");

/**
  Forge Settings
  pulled from forge.json if it exists, otherwise uses default settings
  */
const config = (function () {
  var options = {};

  try {
    options = JSON.parse(fs.readFileSync("forge.json"));
  } catch (e) {
  }

  return fallback(options, {
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
  });
}());

/**
  Forges a file
  */
var Forge = function (file) {
  this.fileName = file;
},

/**
  Tries to load a module, throws a non fatal error if not found
  */
requireModule = function (module) {
  var requirement = null;

  try {
    requirement = require(module);
  } catch (e) {
    if (!config.quiet) {
      console.error(module + " is not installed. Try npm install " + module + " -g\n");
    }
  }

  return requirement;
},

jshint = null,
uglify = null,
gzip = null,
less = null;

if (config.lint) {
  jshint = requireModule("jshint");
}

if (config.compress) {
  uglify = requireModule("uglify-js");
}

if (config.gzip) {
  gzip = requireModule("gzip")
}

if (config.less) {
  less = requireModule("less");
}
// TODO jsdocs
// node module doesn't exist :(

// Forge Object
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
      var file = fileName + '.' + ext;

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

    const lint = jshint.JSHINT;

    var data = "",
        self = this;

    if (log) {
      console.log('\nValidating ./' + this.fileName + ' with jshint');
    }

    // run jshint on the code
    lint(code);

    // get data
    data = lint.data();

    // if there are no errors
    if (!data.errors) {
      if (log) {
        console.log('Lint Free!');
      }

      return;
    }

    if (log) {
      console.log('\nErrors found in ' + this.fileName);
    }

    // output errors to console
    data.errors.forEach(function (error) {
      if (error) {
        console.log(self.fileName + ':' + error.line + ':' + error.character + ' ' + error.reason);
      }
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

/** Application */
(function () {
  const log = (!config.quiet);

  /**
    @return {Array} files that need to be forged
    */
  var files = config.files ? config.files : (function () {
    var obj = {};

    Object.keys(args).forEach(function (ext) {
      var src = [];

      fs.readdirSync(args[ext]).forEach(function (file) {
        if (file.indexOf("." + ext) !== -1) {
          src.push(args[ext] + "/" + file.replace("." + ext, ""));
        }
      });

      obj[ext] = src;
    });

    return obj;
  }()),
  
  /**
    Forging logic
    */
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
  Object.keys(files).forEach(doForge);

  // Done :)
  if (log) {
    console.log('\nDone!');
  }
}());
