# forge

An easy to use CLI tool written in NodeJS useful for compiling projects.

I wrote this because I was sick of writing the same Jakefiles over and over again for building my projects.
Now I have a simple CLI tool, I can just cd into my project and run `forge` and have it do it's magic.

## Installing

NPM

    sudo npm install forge -g

Unix/Linux

    git clone git://github.com/goatslacker/forge.git
    cd forge
    sudo make

## How to use

You can have forge automatically detect your build directory

    cd myproject
    forge

If that fails, you can tell forge the directory. The use is --fileExtension directory

    cd myproject
    forge --js source

For convenience, you can set a config file `forge.json` in your project's root folder

    {
      "files": {
        "js": ["src/file1", "src/file2", "src/file3"]
      }
    }

    cd myproject
    forge

## Custom config

Below are the default settings for forge. You can customize these and place them in your `forge.json` config file

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

## License

    Copyright (C) 2011 by Josh Perez <josh@goatslacker.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
