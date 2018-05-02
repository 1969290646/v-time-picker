const path = require('path')

console.log(path.resolve(__dirname))

module.export = {
  entry: '../src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
