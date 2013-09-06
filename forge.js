/*jshint asi: true */
module.exports = forge

var fu = require('fu')
var fs = require('fs')

function isFile(file) {
  return fs.existsSync(file)
}

function requireTransform(name) {
  try {
    return require(name)
  } catch (ex) {
    return null
  }
}

function transformFiles(transforms) {
  return function (file) {
    return addTransforms(fs.createReadStream(file), transforms, file)
  }
}

function transformStdin(transforms) {
  process.stdin.resume()
  return addTransforms(process.stdin, transforms, null)
}

function addTransforms(stream, transforms, fileName) {
  return fu.foldl(function (stream, transform) {
    return stream.pipe(transform(fileName))
  }, transforms, stream).pipe(process.stdout)
}

function append(obj, prop, x) {
  obj[prop].push(x)
  return obj
}

function forge(args) {
  var x = fu.foldl(function (obj, arg) {
    try {
      return isFile(arg)
        ? append(obj, 'files', arg)
        : append(obj, 'transforms', require(arg))
    } catch (ex) {
      return obj
    }
  }, args, { transforms: [], files: [] })

  return x.files.length
    ? fu.map(transformFiles(x.transforms), x.files)
    : transformStdin(x.transforms)
}
