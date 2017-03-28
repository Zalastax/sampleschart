var webpack = require('webpack')

module.exports = {
    entry: './src/entry.js',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /moment/,
            loader: 'null-loader'
        }]
    }
}
