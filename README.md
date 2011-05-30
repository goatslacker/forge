# forge - An easy to use CLI tool for compiling projects

## Installing

* Unix/Linux

    git clone git://github.com/goatslacker/forge.git
    cd forge
    sudo make

## How to use

1. Automatically detects directories

    cd myproject
    forge

2. You tell forge the directory

    cd myproject
    forge --js source

3. Config file `forge.json`

    {
      "files": {
        "js": ["src/file1", "src/file2", "src/file3"]
      }
    }

    cd myproject
    forge

## Custom config

    {
      /* the application's name */
      appName: CURRENT_DIRECTORY
    
      /* the build directory */
      buildDirectory: 'build',

      /* use jshint to check the code */
      lint: true,

      /* uglify-js compresses the code */
      compress: true,

      /* apply gzip after compression */
      gzip: true,

      /* less for stylesheets */
      less: false,

      /* no logging for Forge */
      quiet: false
    }
