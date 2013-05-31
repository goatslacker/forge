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

function forge(args) {
  var x = fu.foldl(function (obj, arg) {
    var item
    if (isFile(arg)) {
      obj.files.push(arg)
    } else if (item = requireTransform(arg)) {
      obj.transforms.push(item)
    }
    return obj
  }, args, { transforms: [], files: [] })

  return fu.map(function (file) {
    var stream = fs.createReadStream(file)
    return fu.foldl(function (stream, transform) {
      return stream.pipe(transform(file))
    }, x.transforms, stream).pipe(process.stdout)
  }, x.files)
}
